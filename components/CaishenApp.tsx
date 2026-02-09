"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAccount, useBalance, useChainId, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { parseEther } from "viem";
import { OUTCOMES, PALETTE, SUGGESTED_AMOUNTS, HOUSE_WALLET_ADDRESS, ORACLE_ADDRESSES, MIN_OFFERING } from "@/lib/constants";
import {
  hasEight,
  isDeathNumber,
  formatMON,
  isForbiddenDay,
  isGhostHour,
  isTuesday,
} from "@/lib/game-logic";
import FloatingElements from "./FloatingElements";
import ChibiCaiShen from "./ChibiCaiShen";
import FuSymbol from "./FuSymbol";
import GoldIngot from "./GoldIngot";
import PoolDisplay from "./PoolDisplay";
import TabBar, { type TabId } from "./TabBar";
import ChatMessage from "./ChatMessage";
import HistoryItem, { type HistoryEntry } from "./HistoryItem";
import RulesPanel from "./RulesPanel";
import EnvelopeReveal from "./EnvelopeReveal";
import WelcomeGate from "./WelcomeGate";
import ConnectWalletButton from "./ConnectWalletButton";
import NetworkSwitcher from "./NetworkSwitcher";

interface Message {
  text: string;
  bot: boolean;
  footer?: string;
}

interface RevealState {
  outcome: number;
  payout: number;
  loading?: boolean;
}

export default function CaishenApp() {
  const [showGate, setShowGate] = useState(true);
  const [amount, setAmount] = useState("");
  const [wish, setWish] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "恭喜發財! I am CáiShén, God of Wealth. Send me an offering with the sacred number 8 and I shall reveal your fortune... 🧧",
      bot: true,
    },
  ]);
  const [tab, setTab] = useState<TabId>("play");
  const [revealing, setRevealing] = useState<RevealState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Wallet hooks
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // Convex history — only fetch when viewing the history tab
  const convexHistory = useQuery(
    api.fortuneHistory.getBySender,
    tab === "history" && address ? { sender: address } : "skip"
  );
  const history: HistoryEntry[] = useMemo(
    () =>
      (convexHistory ?? []).map((entry) => ({
        sender: entry.sender,
        amount: parseFloat(entry.amount),
        outcome: entry.tier > 0 ? entry.tier - 1 : 0,
        payout: parseFloat(entry.monSent),
        time: entry.timestamp,
        txHash: entry.txHash,
        explorerUrl: entry.explorerUrl,
        returnTxHash: entry.returnTxHash ?? undefined,
      })),
    [convexHistory]
  );
  const network = chainId === 10143 ? "testnet" : "mainnet";
  const minOffer = MIN_OFFERING[network] ?? 8;
  const suggestedAmounts = SUGGESTED_AMOUNTS[network] ?? SUGGESTED_AMOUNTS.mainnet;
  const oracleAddress = ORACLE_ADDRESSES[network];
  const { data: poolBalance, refetch: refetchPool } = useBalance({ address: oracleAddress });
  const pool = poolBalance ? parseFloat(poolBalance.formatted) : 0;
  const { refetch: refetchBalance } = useBalance({ address });
  const { sendTransaction, data: txHash, isPending: isSending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // When wallet connects, show greeting
  const hasGreeted = useRef(false);
  useEffect(() => {
    if (isConnected && address && !hasGreeted.current) {
      hasGreeted.current = true;
      addMessage(
        "A new seeker of fortune approaches... Your wallet is connected. The Celestial Pool awaits your offering. Remember: the number 8 is sacred. 🏮"
      );
    }
  }, [isConnected, address]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle tx confirmation → call /api/fortune → show result
  useEffect(() => {
    if (isConfirmed && txHash && pendingAmount !== null) {
      const val = pendingAmount;
      setPendingAmount(null);

      // Show bot confirmation now that tx is confirmed
      if (pendingCommentRef.current) {
        addMessage(pendingCommentRef.current);
        pendingCommentRef.current = null;
      }

      // Show loading red packet immediately
      setRevealing({ outcome: 0, payout: 0, loading: true });

      fetch(`/api/fortune?network=${network}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash, message: pendingWishRef.current }),
      })
        .then((res) => res.json())
        .then((data) => {
          // New API response shape: { caishen: { tier, blessing, outcome }, multiplier, mon_sent, ... }
          const tier = (data.caishen?.tier ?? 0) as number;
          // Map tier (1-6) to OUTCOMES index (0-5), tier 0 means error
          const outcomeIdx = tier > 0 ? tier - 1 : 0;
          const payout = parseFloat(data.mon_sent || "0");

          setRevealing({ outcome: outcomeIdx, payout });

          // Store blessing for use when reveal finishes
          if (data.caishen?.blessing) {
            pendingBlessingRef.current = data.caishen.blessing;
          }
          if (data.explorer_url && data.txhash_return) {
            pendingExplorerRef.current = `${data.explorer_url.split("/tx/")[0]}/tx/${data.txhash_return}`;
          } else {
            pendingExplorerRef.current = null;
          }

          // Refresh balances after fortune processing
          refetchBalance();
          refetchPool();
        })
        .catch(() => {
          setRevealing(null);
          addMessage(
            "The celestial connection was disrupted... Please try again. 🌩️"
          );
          setIsProcessing(false);
        });
    }
  }, [isConfirmed, txHash]); // eslint-disable-line react-hooks/exhaustive-deps

  const addMessage = useCallback((text: string, bot = true, footer?: string) => {
    setMessages((prev) => [...prev, { text, bot, footer }]);
  }, []);

  const pendingBlessingRef = useRef<string | null>(null);
  const pendingExplorerRef = useRef<string | null>(null);
  const pendingCommentRef = useRef<string | null>(null);
  const pendingWishRef = useRef<string>("");

  const handleSubmit = () => {
    if (isProcessing || !isConnected) return;

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      addMessage(
        "You offer me... nothing? Even the dumplings laugh at you.",
        true
      );
      return;
    }

    // Below minimum
    if (val < minOffer) {
      addMessage(wish || `${val} MON offering`, false, `${val} MON offering`);
      addMessage(
        `${val} MON? The minimum offering is ${minOffer} MON. You insult me with pocket change? Return when you are serious about prosperity.`
      );
      setAmount("");
      return;
    }

    // No 8
    if (!hasEight(val)) {
      addMessage(wish || `${val} MON offering`, false, `${val} MON offering`);
      addMessage(
        `${val} MON? Not a single 8 in sight. Do you come to the God of Wealth with this energy? Payment returned minus 0.04 MON rudeness fee. The 4 is intentional. 😤`
      );
      setAmount("");
      return;
    }

    // Valid! Process
    setIsProcessing(true);

    const eightCount = (String(val).match(/8/g) || []).length;
    const eightComment =
      eightCount >= 4
        ? `${eightCount} 8s?! You understand the assignment!`
        : eightCount >= 3
        ? "Triple prosperity! The ancestors smile!"
        : eightCount >= 2
        ? "Double 8s! Twice the luck!"
        : "The sacred 8 is present. Acceptable.";

    let penaltyWarning = "";
    if (isForbiddenDay()) {
      penaltyWarning = ` ⚠️ The ${new Date().getDate()}th... a day haunted by death. CáiShén's mood darkens!`;
    } else if (isGhostHour()) {
      penaltyWarning =
        " ⚠️ 4:44... The Ghost Hour dims your fortune. CáiShén's mood darkens!";
    } else if (isDeathNumber(val)) {
      penaltyWarning =
        " ⚠️ Multiple 4s... death numbers cloud your luck. CáiShén's mood darkens! ☠️";
    } else if (isTuesday()) {
      penaltyWarning = " ⚠️ Tuesday penalty — CáiShén's mood darkens!";
    }

    pendingCommentRef.current = null;
    pendingWishRef.current = wish || "Fortune favors the bold";

    // Clear chat and show fresh user message
    setMessages([
      { text: wish || "Fortune favors the bold", bot: false, footer: `${val} MON offering` },
    ]);
    setAmount("");
    setWish("");

    // Send real MON transaction
    setPendingAmount(val);
    sendTransaction({
      to: HOUSE_WALLET_ADDRESS,
      value: parseEther(String(val)),
    });
  };

  // Reset processing state if tx fails
  useEffect(() => {
    if (!isSending && !isConfirming && pendingAmount !== null && !isConfirmed && !txHash) {
      // Transaction was rejected or failed
      setPendingAmount(null);
      pendingCommentRef.current = null;
      setIsProcessing(false);
      addMessage("Transaction cancelled. The God of Wealth awaits your return. 🏮");
    }
  }, [isSending, isConfirming, pendingAmount, isConfirmed, txHash]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRevealDone = () => {
    const r = revealing!;
    const o = OUTCOMES[r.outcome];

    // Build footer with payout info
    const payoutFooter = r.payout > 0 ? `+${formatMON(r.payout)} MON returned` : undefined;

    // Use AI-generated blessing if available, otherwise fallback
    if (pendingBlessingRef.current) {
      addMessage(pendingBlessingRef.current, true, payoutFooter);
      pendingBlessingRef.current = null;
      pendingExplorerRef.current = null;
    } else {
      // Fallback responses per tier
      const responses = [
        `The universe owes you nothing today. These dumplings are redeemable... never. 🥟 Try again, perhaps with more 8s.`,
        `Your luck has been... recycled. Added to the Celestial Pool (now ${formatMON(pool)} MON). Your sacrifice feeds future fortunes. 🔄`,
        `Minor Blessing Detected! The universe acknowledges you. Nothing more, nothing less. 💰`,
        `THE GOLDEN PIG APPEARS! 🐷 Your ancestors are smiling. Your enemies are confused.`,
        `🧧 JACKPOT! CáiShén bestows great fortune upon you! 發發發!`,
        `🎰🎰🎰 天啊! HEAVENS ABOVE! SUPER JACKPOT! 發發發! DIVINE PROSPERITY!`,
      ];
      addMessage(responses[r.outcome] || responses[0], true, payoutFooter);
    }

    setRevealing(null);
    setIsProcessing(false);
  };

  const amountValid = (() => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return null;
    if (val < minOffer) return false;
    if (!hasEight(val)) return false;
    return true;
  })();

  const buttonDisabled = !isConnected || isProcessing || isSending || isConfirming;

  const buttonText = isSending
    ? "🧧 Confirm in Wallet..."
    : isConfirming
    ? "🧧 Confirming Tx..."
    : isProcessing
    ? "🧧 CáiShén is deciding..."
    : isConnected
    ? "🧧 GIVE ME MY RED PACKET"
    : "Connect Wallet First";

  return (
    <>
      {showGate && <WelcomeGate onEnter={() => setShowGate(false)} />}

      <FloatingElements />
      <ChibiCaiShen />

      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ─── Header ──────────────────────────────────────────── */}
        <div style={{ padding: "20px 20px 0", textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <GoldIngot size={24} />
            <FuSymbol size={36} />
            <GoldIngot size={24} />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
              fontSize: 28,
              fontWeight: 900,
              background: "linear-gradient(135deg, #DC143C, #A91030)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.2,
            }}
          >
            財神 Bot
          </h1>
          <div
            style={{
              fontSize: 11,
              color: PALETTE.textMuted,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginTop: 2,
            }}
          >
            Red Envelope Jackpot
          </div>

          {/* Wallet + Network */}
          <div
            style={{
              marginTop: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ConnectWalletButton />
            {isConnected && <NetworkSwitcher />}
          </div>
        </div>

        {/* ─── Pool Display ────────────────────────────────────── */}
        <div style={{ padding: "16px 20px 0" }}>
          <PoolDisplay pool={pool} />
        </div>

        {/* ─── Tabs ────────────────────────────────────────────── */}
        <div style={{ padding: "16px 20px 0" }}>
          <TabBar active={tab} onChange={setTab} />
        </div>

        {/* ─── Content ─────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            padding: "0 20px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {tab === "play" && (
            <div
              ref={chatRef}
              style={{
                flex: 1,
                overflowY: "auto",
                paddingBottom: 8,
                minHeight: 0,
              }}
            >
              {messages.map((m, i) => (
                <ChatMessage key={i} message={m.text} isBot={m.bot} footer={m.footer} />
              ))}
            </div>
          )}

          {tab === "history" && (
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
              {convexHistory === undefined ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 20px",
                    color: PALETTE.textMuted,
                  }}
                >
                  <div style={{ fontSize: 14 }}>Loading history...</div>
                </div>
              ) : history.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 20px",
                    color: PALETTE.textLight,
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🧧</div>
                  <div style={{ fontSize: 14 }}>
                    No offerings yet. Make your first play!
                  </div>
                </div>
              ) : (
                history.map((e, i) => <HistoryItem key={i} entry={e} />)
              )}
            </div>
          )}

          {tab === "rules" && (
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
              <RulesPanel network={network} />
            </div>
          )}
        </div>

        {/* ─── Bottom Input Panel ──────────────────────────────── */}
        {tab === "play" && (
          <div
            style={{
              padding: "12px 20px 20px",
              borderTop: `1px solid ${PALETTE.border}`,
              background: PALETTE.card,
            }}
          >
            {/* Suggested amounts */}
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 10,
                overflowX: "auto",
                paddingBottom: 2,
              }}
            >
              {suggestedAmounts.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 16,
                    border: `1px solid ${amount === String(a) ? PALETTE.red : PALETTE.border}`,
                    background:
                      amount === String(a)
                        ? "rgba(220,20,60,0.06)"
                        : PALETTE.cream,
                    color:
                      amount === String(a) ? PALETTE.red : PALETTE.textMuted,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                >
                  {a} MON
                </button>
              ))}
            </div>

            {/* Amount Input */}
            <div style={{ position: "relative", marginBottom: 8 }}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter offering (include an 8!)"
                style={{
                  width: "100%",
                  padding: "12px 80px 12px 16px",
                  borderRadius: 12,
                  border: `1.5px solid ${amountValid === true ? PALETTE.gold : amountValid === false ? "#E74C3C" : PALETTE.border}`,
                  fontSize: 15,
                  fontWeight: 600,
                  background:
                    amountValid === true
                      ? "rgba(255,215,0,0.04)"
                      : PALETTE.bg,
                  color: PALETTE.text,
                  transition: "border-color 0.2s, background 0.2s",
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 12,
                  fontWeight: 600,
                  color: PALETTE.textMuted,
                }}
              >
                $MON
              </span>
              {amountValid === true && (
                <span
                  style={{
                    position: "absolute",
                    right: 56,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 14,
                  }}
                >
                  ✨
                </span>
              )}
            </div>

            {/* Wish Input */}
            <textarea
              value={wish}
              onChange={(e) => setWish(e.target.value.slice(0, 280))}
              placeholder="Add your Chinese New Year wishes too to get a better chance at hitting the jackpot!"
              rows={2}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${PALETTE.border}`,
                fontSize: 13,
                background: PALETTE.bg,
                color: PALETTE.text,
                resize: "none",
                marginBottom: 10,
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                lineHeight: 1.4,
              }}
            />

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={buttonDisabled}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 14,
                border: "none",
                background: buttonDisabled
                  ? "#E0D5C5"
                  : "linear-gradient(135deg, #DC143C 0%, #A91030 50%, #DC143C 100%)",
                backgroundSize: "200% auto",
                color: buttonDisabled ? "#A89F91" : "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: buttonDisabled ? "not-allowed" : "pointer",
                letterSpacing: 0.5,
                boxShadow:
                  !buttonDisabled
                    ? "0 6px 20px rgba(220,20,60,0.3)"
                    : "none",
                transition: "all 0.2s",
                animation:
                  !buttonDisabled ? "shimmer 3s linear infinite" : "none",
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              }}
              onMouseDown={(e) => {
                if (!buttonDisabled)
                  e.currentTarget.style.transform = "scale(0.98)";
              }}
              onMouseUp={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              {buttonText}
            </button>

            {(isTuesday() || isForbiddenDay() || isGhostHour()) && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "#E74C3C",
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                ⚠️{" "}
                {isForbiddenDay()
                  ? "Forbidden Day"
                  : isGhostHour()
                  ? "Ghost Hour"
                  : "Tuesday Penalty"}{" "}
                Active — CáiShén&apos;s mood darkens
              </div>
            )}
          </div>
        )}
      </div>

      {/* Envelope reveal overlay */}
      {revealing && (
        <EnvelopeReveal
          outcome={revealing.outcome}
          payout={revealing.payout}
          loading={revealing.loading}
          onDone={handleRevealDone}
        />
      )}
    </>
  );
}
