"use client";

import { useChainId, useSwitchChain } from "wagmi";
import { monad, monadTestnet } from "viem/chains";
import { PALETTE } from "@/lib/constants";

export default function NetworkSwitcher() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isMainnet = chainId === monad.id;
  const isTestnet = chainId === monadTestnet.id;

  return (
    <div
      style={{
        display: "inline-flex",
        borderRadius: 16,
        border: `1px solid ${PALETTE.border}`,
        overflow: "hidden",
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      <button
        onClick={() => switchChain({ chainId: monad.id })}
        style={{
          padding: "4px 10px",
          border: "none",
          background: isMainnet ? PALETTE.red : "transparent",
          color: isMainnet ? "#fff" : PALETTE.textMuted,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        Mainnet
      </button>
      <button
        onClick={() => switchChain({ chainId: monadTestnet.id })}
        style={{
          padding: "4px 10px",
          border: "none",
          background: isTestnet ? PALETTE.red : "transparent",
          color: isTestnet ? "#fff" : PALETTE.textMuted,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        Testnet
      </button>
    </div>
  );
}
