import { NextResponse } from "next/server";
import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { NETWORKS, type NetworkName } from "@/lib/constants";
import { calculateFortune, isForbiddenDay, isGhostHour, isTuesday } from "@/lib/game-logic";
import { generateBlessing } from "@/lib/ai";

// Track processed transactions per network (replay protection)
const processedTxs: Record<string, Set<string>> = {
  testnet: new Set(),
  mainnet: new Set(),
};

// Periodic cleanup to prevent memory bloat
setInterval(() => {
  for (const network of Object.keys(processedTxs)) {
    if (processedTxs[network].size > 10000) {
      processedTxs[network].clear();
    }
  }
}, 3600000);

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
    } else if (NETWORKS.mainnet.oracleAddress) {
      network = "mainnet";
    } else {
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

    // Replay protection
    if (processedTxs[network].has(txhash.toLowerCase())) {
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

    // Mark as processed
    processedTxs[network].add(txhash.toLowerCase());

    // Calculate fortune
    const fortune = calculateFortune(tx.value.toString(), txhash, message);

    // Check if it's an error result (tier 0)
    if (fortune.outcome.tier === 0) {
      return NextResponse.json({
        success: false,
        caishen: {
          outcome: `${fortune.outcome.emoji} ${fortune.outcome.label}`,
          tier: 0,
          blessing: fortune.blessing,
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

    // Valid fortune result — generate AI blessing
    const fortuneResult = fortune as {
      outcome: { emoji: string; label: string; tier: number; minMult: number; maxMult: number };
      multiplier: number;
      penaltiesApplied: string[];
      penaltyMultiplier: number;
      blessing: string;
      hasEight: boolean;
      minOffering: boolean;
    };

    const aiBlessing = await generateBlessing(
      `${fortuneResult.outcome.emoji} ${fortuneResult.outcome.label}`,
      fortuneResult.outcome.tier,
      fortuneResult.multiplier,
      formatEther(tx.value),
      fortuneResult.penaltiesApplied,
    );

    // Calculate return amount using BigInt math
    const returnAmount =
      fortuneResult.multiplier > 0
        ? (tx.value * BigInt(Math.floor(fortuneResult.multiplier * 100))) / BigInt(100)
        : BigInt(0);

    // Send MON payback
    let returnTxHash: string | null = null;
    let returnStatus = "pending";

    try {
      if (returnAmount > 0 && walletClient) {
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

    return NextResponse.json({
      success: true,
      caishen: {
        outcome: `${fortuneResult.outcome.emoji} ${fortuneResult.outcome.label}`,
        tier: fortuneResult.outcome.tier,
        blessing: aiBlessing,
      },
      offering: {
        amount: formatEther(tx.value),
        has_eight: fortuneResult.hasEight,
        min_offering_met: fortuneResult.minOffering,
      },
      multiplier: fortuneResult.multiplier,
      mon_received: formatEther(tx.value),
      mon_sent: formatEther(returnAmount),
      txhash_return: returnTxHash,
      return_status: returnStatus,
      superstitions: {
        penalties_applied: fortuneResult.penaltiesApplied,
        penalty_multiplier: fortuneResult.penaltyMultiplier,
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
