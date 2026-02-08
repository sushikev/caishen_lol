import { NextResponse } from "next/server";
import { createPublicClient, http, formatEther } from "viem";
import { NETWORKS, type NetworkName } from "@/lib/constants";

const startTime = Date.now();

export async function GET() {
  const status: Record<string, unknown> = {
    status: "ok",
    uptime: `${Math.floor((Date.now() - startTime) / 1000)}s`,
    networks: {} as Record<string, unknown>,
  };

  const networks = status.networks as Record<string, unknown>;

  for (const [network, config] of Object.entries(NETWORKS)) {
    if (!config.oracleAddress) {
      networks[network] = { status: "not configured" };
      continue;
    }

    const chain = {
      id: config.chainId,
      name: config.name,
      nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
      rpcUrls: { default: { http: [config.rpcUrl] } },
    } as const;

    try {
      const publicClient = createPublicClient({
        chain,
        transport: http(config.rpcUrl),
      });

      const balance = await publicClient.getBalance({
        address: config.oracleAddress as `0x${string}`,
      });

      networks[network] = {
        address: config.oracleAddress,
        balance: formatEther(balance) + " MON",
        rpc: config.rpcUrl,
        explorer: config.explorer,
      };
    } catch {
      networks[network] = { error: "Connection failed" };
    }
  }

  return NextResponse.json(status);
}
