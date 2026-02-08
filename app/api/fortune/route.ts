import { NextResponse } from "next/server";
import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { NETWORKS, OUTCOMES, MIN_OFFERING, type NetworkName } from "@/lib/constants";
import {
  detectPenalties,
  calculatePayout,
  fallbackTierSelection,
  validateOffering,
  isForbiddenDay,
  isGhostHour,
  isTuesday,
} from "@/lib/game-logic";
import { consultCaishen, getFallbackBlessing } from "@/lib/ai";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

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
    const { txHash, message } = body;

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

    const txhash = txHash as Hex;

    // Determine network from query param or auto-detect
    const url = new URL(request.url);
    const networkParam = url.searchParams.get("network") as NetworkName | null;

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

    // Fetch oracle wallet (pool) balance
    const oracleAddress = walletClient?.account.address || (config.oracleAddress as `0x${string}`);
    const poolBalance = await publicClient.getBalance({ address: oracleAddress });

    // Consult CáiShén AI oracle
    let tier: number;
    let blessing: string;

    const aiResult = await consultCaishen({
      offering: formatEther(tx.value),
      wish: message,
      penalties,
      penaltyMultiplier,
      poolBalance: formatEther(poolBalance),
    });

    if (aiResult) {
      tier = aiResult.tier;
      blessing = aiResult.blessing;
    } else {
      // Fallback to deterministic hash-based tier selection
      tier = fallbackTierSelection(txhash, message, penaltyMultiplier);
      blessing = getFallbackBlessing(tier);
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
