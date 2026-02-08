"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PALETTE } from "@/lib/constants";

export default function ConnectWalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none" as const,
                userSelect: "none" as const,
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    style={{
                      padding: "10px 28px",
                      borderRadius: 24,
                      border: "none",
                      background:
                        "linear-gradient(135deg, #DC143C, #A91030)",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 4px 16px rgba(220,20,60,0.25)",
                      transition: "transform 0.15s",
                    }}
                    onMouseDown={(e) =>
                      (e.currentTarget.style.transform = "scale(0.97)")
                    }
                    onMouseUp={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    🏮 Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 20,
                      border: "none",
                      background: "#E74C3C",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Wrong Network
                  </button>
                );
              }

              return (
                <button
                  onClick={openAccountModal}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    borderRadius: 20,
                    background: PALETTE.cream,
                    border: `1px solid ${PALETTE.border}`,
                    fontSize: 12,
                    color: PALETTE.textMuted,
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#27AE60",
                    }}
                  />
                  {account.displayName}
                  {account.displayBalance
                    ? ` (${account.displayBalance})`
                    : ""}
                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
