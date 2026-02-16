import { NextResponse } from "next/server";
import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  formatUnits,
  parseAbi,
  parseEventLogs,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { NETWORKS, OUTCOMES, MIN_OFFERING, FORTUNE_TOKEN_ADDRESS, JUICE_MAX_TIER, type NetworkName } from "@/lib/constants";
import {
  detectPenalties,
  calculatePayout,
  fallbackTierSelection,
  validateOffering,
  calculateJuiceRerolls,
  applyJuiceRerolls,
  isForbiddenDay,
  isGhostHour,
  isTuesday,
} from "@/lib/game-logic";
import { consultCaishen, getFallbackBlessing } from "@/lib/ai";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

const erc20TransferAbi = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)"
]);

function getClients(network: NetworkName) {
  const config = NETWORKS[network];
  if (!config.oracleAddress) return null;

  const chain = {
    id: config.chainId,
    name: config.name,
    nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
    rpcUrls: { default: { http: [config.rpcUrl] } },
  } as const;

  const publicClient = createPublicClient({
    chain,
    transport: http(config.rpcUrl),
  });

  if (!process.env.ORACLE_PRIVATE_KEY) return { publicClient, walletClient: null, chain };

  const account = privateKeyToAccount(process.env.ORACLE_PRIVATE_KEY as Hex);
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(config.rpcUrl),
  });

  return { publicClient, walletClient, chain };
}

async function detectNetwork(txhash: Hex): Promise<NetworkName | null> {
  for (const network of Object.keys(NETWORKS) as NetworkName[]) {
    const clients = getClients(network);
    if (!clients) continue;
    try {
      const receipt = await clients.publicClient.getTransactionReceipt({ hash: txhash });
      if (receipt) return network;
    } catch {
      continue;
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { txHash, message, juiceTxHash } = body;

    if (!txHash || !message) {
      return NextResponse.json(
        { error: "Missing txHash or message" },
        { status: 400 },
      );
    }

    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json(
        { error: "Invalid txHash" },
        { status: 400 },
      );
    }

    if (juiceTxHash && !/^0x[a-fA-F0-9]{64}$/.test(juiceTxHash)) {
      return NextResponse.json(
        { error: "Invalid juiceTxHash" },
        { status: 400 },
      );
    }

    const txhash = txHash as Hex;

    // Determine network from query param or auto-detect
    const url = new URL(request.url);
    const networkParam = url.searchParams.get("network") as NetworkName | null;
    const useFallback = url.searchParams.get("fallback") === "true";

    let network: NetworkName;
    if (networkParam && NETWORKS[networkParam]) {
      network = networkParam;
    } else {
      // Auto-detect by trying to find the tx on each network
      const detected = await detectNetwork(txhash);
      if (!detected) {
        return NextResponse.json(
          { error: "Transaction not found", hint: "Use ?network=testnet for testnet" },
          { status: 400 },
        );
      }
      network = detected;
    }

    const config = NETWORKS[network];
    const clients = getClients(network);

    if (!clients) {
      return NextResponse.json(
        { error: `Network ${network} not configured` },
        { status: 500 },
      );
    }

    const { publicClient, walletClient } = clients;

    // Replay protection via Convex
    const convex = getConvexClient();
    const alreadyProcessed = await convex.query(api.processedTxs.isProcessed, {
      txHash: txhash.toLowerCase(),
    });
    if (alreadyProcessed) {
      return NextResponse.json(
        { error: "Already processed" },
        { status: 400 },
      );
    }

    if (juiceTxHash) {
      const juiceAlreadyProcessed = await convex.query(api.processedTxs.isProcessed, {
        txHash: (juiceTxHash as string).toLowerCase(),
      });
      if (juiceAlreadyProcessed) {
        return NextResponse.json(
          { error: "Juice tx already processed" },
          { status: 400 },
        );
      }
    }

    // Verify transaction on-chain
    const receipt = await publicClient.getTransactionReceipt({ hash: txhash });
    if (!receipt || receipt.status !== "success") {
      return NextResponse.json(
        { error: "Transaction not found or failed" },
        { status: 400 },
      );
    }

    const tx = await publicClient.getTransaction({ hash: txhash });
    if (tx.to?.toLowerCase() !== config.oracleAddress.toLowerCase()) {
      return NextResponse.json(
        {
          error: "Not sent to CáiShén oracle",
          expected: config.oracleAddress,
          received: tx.to,
        },
        { status: 400 },
      );
    }

    // Mark as processed in Convex
    await convex.mutation(api.processedTxs.markProcessed, {
      txHash: txhash.toLowerCase(),
      network,
    });

    // Validate offering (min offering per network, must contain 8)
    const minOffer = MIN_OFFERING[network] ?? 8;
    const offeringError = validateOffering(tx.value.toString(), minOffer);
    if (offeringError) {
      try {
        await convex.mutation(api.fortuneHistory.insertResult, {
          sender: tx.from,
          txHash: txhash,
          network,
          amount: formatEther(tx.value),
          outcome: `${offeringError.outcome.emoji} ${offeringError.outcome.label}`,
          tier: 0,
          multiplier: 0,
          monSent: "0",
          blessing: offeringError.blessing,
          returnTxHash: null,
          returnStatus: "no_return",
          penalties: [],
          penaltyMultiplier: 1,
          explorerUrl: `${config.explorer}/tx/${txhash}`,
          timestamp: Date.now(),
        });
      } catch (e) {
        console.error("Failed to insert fortune history:", e);
      }

      return NextResponse.json({
        success: false,
        caishen: {
          outcome: `${offeringError.outcome.emoji} ${offeringError.outcome.label}`,
          tier: 0,
          blessing: offeringError.blessing,
        },
        offering: {
          amount: formatEther(tx.value),
          has_eight: false,
          min_offering_met: false,
        },
        multiplier: 0,
        mon_received: formatEther(tx.value),
        mon_sent: "0",
        txhash_return: null,
        return_status: "no_return",
        superstitions: {
          penalties_applied: [],
          penalty_multiplier: 1,
          is_forbidden_day: isForbiddenDay(),
          is_ghost_hour: isGhostHour(),
          is_tuesday: isTuesday(),
        },
        network,
        sender: tx.from,
        explorer_url: `${config.explorer}/tx/${txhash}`,
        timestamp: new Date().toISOString(),
      });
    }

    // Detect superstition penalties
    const { penalties, penaltyMultiplier } = detectPenalties(tx.value.toString());

    // Juice verification
    let juiceRerolls = 0;
    let juiceLabel = "";
    let juiceAmount = "0";

    if (juiceTxHash) {
      try {
        const juiceHash = juiceTxHash as Hex;
        const juiceReceipt = await publicClient.getTransactionReceipt({ hash: juiceHash });
        const juiceTx = await publicClient.getTransaction({ hash: juiceHash });

        if (!juiceReceipt || juiceReceipt.status !== "success") {
          return NextResponse.json(
            { error: "Juice transaction not found or failed" },
            { status: 400 },
          );
        }

        if (juiceTx.from.toLowerCase() !== tx.from.toLowerCase()) {
          return NextResponse.json(
            { error: "Juice tx sender must match offering tx sender" },
            { status: 400 },
          );
        }

        const oracleAddr = (walletClient?.account.address || config.oracleAddress).toLowerCase();
        const tokenAddr = FORTUNE_TOKEN_ADDRESS[network]?.toLowerCase();

        const transferLogs = parseEventLogs({
          abi: erc20TransferAbi,
          logs: juiceReceipt.logs,
        });

        const matchingTransfer = transferLogs.find(
          (log) =>
            log.address.toLowerCase() === tokenAddr &&
            log.args.to.toLowerCase() === oracleAddr
        );

        if (!matchingTransfer) {
          return NextResponse.json(
            { error: "No FORTUNE_TOKEN transfer to oracle found in juice tx" },
            { status: 400 },
          );
        }

        const tokenAmountRaw = matchingTransfer.args.value;
        juiceAmount = formatUnits(tokenAmountRaw, 18);

        const result = calculateJuiceRerolls(tokenAmountRaw);
        juiceRerolls = result.rerolls;
        juiceLabel = result.label;

        // Mark juice tx as processed
        await convex.mutation(api.processedTxs.markProcessed, {
          txHash: juiceHash.toLowerCase(),
          network,
        });
      } catch (e) {
        if (e instanceof Error && e.message.includes("already processed")) throw e;
        console.error("Juice verification failed:", e);
        // Non-fatal: proceed without juice rerolls
      }
    }

    // Fetch oracle wallet (pool) balance
    const oracleAddress = walletClient?.account.address || (config.oracleAddress as `0x${string}`);
    const poolBalance = await publicClient.getBalance({ address: oracleAddress });

    // Consult CáiShén AI oracle
    let tier: number;
    let blessing: string;
    let oracleSource: "ai" | "fallback";

    const aiResult = useFallback ? null : await consultCaishen({
      offering: formatEther(tx.value),
      wish: message,
      penalties,
      penaltyMultiplier,
      poolBalance: formatEther(poolBalance),
      txHash: txhash,
      juice: juiceRerolls > 0 ? { rerolls: juiceRerolls, label: juiceLabel, tokenAmount: juiceAmount } : null,
    });

    let baseTier: number;

    if (aiResult) {
      // AI already factors juice into its decision; cap at JUICE_MAX_TIER if juiced
      baseTier = aiResult.tier;
      tier = juiceRerolls > 0 ? Math.min(JUICE_MAX_TIER, aiResult.tier) : aiResult.tier;
      blessing = aiResult.blessing;
      oracleSource = "ai";
    } else {
      // Fallback to deterministic hash-based tier selection
      baseTier = fallbackTierSelection(txhash, message, penaltyMultiplier);
      tier = baseTier;
      blessing = getFallbackBlessing(tier);
      oracleSource = "fallback";
      // Apply fallback juice rerolls
      if (juiceRerolls > 0) {
        tier = applyJuiceRerolls(tier, juiceRerolls, txhash, message, penaltyMultiplier);
      }
    }

    // Calculate fixed payout based on tier
    const returnAmount = calculatePayout(tier, tx.value, poolBalance);

    // Get outcome info
    const outcome = OUTCOMES[tier - 1];

    // Send MON payback
    let returnTxHash: string | null = null;
    let returnStatus = "pending";

    try {
      if (returnAmount > BigInt(0) && walletClient) {
        const hash = await walletClient.sendTransaction({
          to: tx.from,
          value: returnAmount,
          gas: BigInt(21000),
        });
        returnTxHash = hash;
        await publicClient.waitForTransactionReceipt({ hash });
        returnStatus = "confirmed";
      } else if (!walletClient) {
        returnStatus = "no_wallet";
      } else {
        returnStatus = "no_return";
      }
    } catch (e) {
      console.error("Return tx failed:", e);
      returnStatus = "failed";
    }

    // Insert fortune history into Convex
    try {
      await convex.mutation(api.fortuneHistory.insertResult, {
        sender: tx.from,
        txHash: txhash,
        network,
        amount: formatEther(tx.value),
        outcome: `${outcome.emoji} ${outcome.label}`,
        tier,
        multiplier: tier,
        monSent: formatEther(returnAmount),
        blessing,
        returnTxHash,
        returnStatus,
        penalties,
        penaltyMultiplier,
        explorerUrl: `${config.explorer}/tx/${txhash}`,
        timestamp: Date.now(),
        juiceTxHash: juiceTxHash || null,
        juiceAmount: juiceRerolls > 0 ? juiceAmount : undefined,
        juiceRerolls: juiceRerolls > 0 ? juiceRerolls : undefined,
      });
    } catch (e) {
      console.error("Failed to insert fortune history:", e);
    }

    return NextResponse.json({
      success: true,
      caishen: {
        outcome: `${outcome.emoji} ${outcome.label}`,
        tier,
        blessing,
        oracle_source: oracleSource,
      },
      offering: {
        amount: formatEther(tx.value),
        has_eight: true,
        min_offering_met: true,
      },
      multiplier: tier,
      mon_received: formatEther(tx.value),
      mon_sent: formatEther(returnAmount),
      txhash_return: returnTxHash,
      return_status: returnStatus,
      superstitions: {
        penalties_applied: penalties,
        penalty_multiplier: penaltyMultiplier,
        is_forbidden_day: isForbiddenDay(),
        is_ghost_hour: isGhostHour(),
        is_tuesday: isTuesday(),
      },
      juice: juiceTxHash ? {
        juice_tx_hash: juiceTxHash,
        token_amount: juiceAmount,
        rerolls: juiceRerolls,
        juice_label: juiceLabel,
        base_tier: baseTier,
        boosted_tier: tier,
      } : null,
      network,
      sender: tx.from,
      explorer_url: `${config.explorer}/tx/${txhash}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Fortune endpoint error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
