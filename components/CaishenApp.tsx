"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { OUTCOMES, PALETTE, SUGGESTED_AMOUNTS, HOUSE_WALLET_ADDRESS } from "@/lib/constants";
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

interface Message {
  text: string;
  bot: boolean;
}

interface RevealState {
  outcome: number;
  payout: number;
}

export default function CaishenApp() {
  const [showGate, setShowGate] = useState(true);
  const [pool, setPool] = useState(888.88);
  const [amount, setAmount] = useState("");
  const [wish, setWish] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "恭喜發財! I am CáiShén, God of Wealth. Send me an offering with the sacred number 8 and I shall reveal your fortune... 🧧",
      bot: true,
    },
  ]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [tab, setTab] = useState<TabId>("play");
  const [revealing, setRevealing] = useState<RevealState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Wallet hooks
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
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

      // Call the fortune API
      fetch("/api/fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash, message: wish }),
      })
        .then((res) => res.json())
        .then((data) => {
          const outcomeIdx = data.outcome as number;
          const outcome = OUTCOMES[outcomeIdx];
          let payout = 0;

          if (outcomeIdx === 0) {
            setPool((p) => p + val * 0.7);
            payout = 0;
          } else if (outcomeIdx === 1) {
            setPool((p) => p + val);
            payout = 0;
          } else if (outcomeIdx === 2) {
            payout = val * 1.5;
          } else if (outcomeIdx === 3) {
            payout = val * 3;
          } else if (outcomeIdx === 4) {
            payout = Math.min(val * 88, pool * 0.5);
            setPool((p) => p - payout);
          }

          setRevealing({ outcome: outcomeIdx, payout });
          setHistory((h) => [
            { amount: val, outcome: outcomeIdx, payout, time: Date.now(), txHash },
            ...h,
          ]);
          setAmount("");
          setWish("");
        })
        .catch(() => {
          addMessage(
            "The celestial connection was disrupted... Please try again. 🌩️"
          );
          setIsProcessing(false);
        });
    }
  }, [isConfirmed, txHash]); // eslint-disable-line react-hooks/exhaustive-deps

  const addMessage = useCallback((text: string, bot = true) => {
    setMessages((prev) => [...prev, { text, bot }]);
  }, []);

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

    // Add user message
    addMessage(`${val} MON offering${wish ? ` — "${wish}"` : ""}`, false);

    // Below minimum
    if (val < 8) {
      addMessage(
        `${val} MON? The minimum offering is 8 MON. You insult me with pocket change? Return when you are serious about prosperity.`
      );
      setAmount("");
      return;
    }

    // No 8
    if (!hasEight(val)) {
      addMessage(
        `${val} MON? Not a single 8 in sight. Do you come to the God of Wealth with this energy? Payment returned minus 0.04 MON rudeness fee. The 4 is intentional. 😤`
      );
      setPool((p) => p + 0.04);
      setAmount("");
      return;
    }

    // Valid! Process
    setIsProcessing(true);

    // Check for penalty conditions
    const penaltyActive =
      isTuesday() || isForbiddenDay() || isGhostHour() || isDeathNumber(val);

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
      penaltyWarning = ` ⚠️ The ${new Date().getDate()}th... a day haunted by death. Win probabilities halved!`;
    } else if (isGhostHour()) {
      penaltyWarning =
        " ⚠️ 4:44... The Ghost Hour dims your fortune. Win probabilities halved!";
    } else if (isDeathNumber(val)) {
      penaltyWarning =
        " ⚠️ Multiple 4s... death numbers cloud your luck. Win probabilities halved! ☠️";
    } else if (isTuesday()) {
      penaltyWarning = " ⚠️ Tuesday penalty — win probabilities halved!";
    }

    addMessage(
      `${val} MON received. ${eightComment}${penaltyWarning} Sending your offering to the Celestial Treasury... 🧧`
    );

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
    }
  }, [isSending, isConfirming, pendingAmount, isConfirmed, txHash]);

  const handleRevealDone = () => {
    const r = revealing!;

    const responses = [
      `The universe owes you nothing today. These dumplings are redeemable... never. 🥟 Try again, perhaps with more 8s.`,
      `Your luck has been... recycled. Added to the Celestial Pool (now ${formatMON(pool)} MON). Your sacrifice feeds future fortunes. 🔄`,
      `Minor Blessing Detected! ${formatMON(r.payout)} MON returned. The universe acknowledges you. Nothing more, nothing less. 💰`,
      `THE GOLDEN PIG APPEARS! 🐷 ${formatMON(r.payout)} MON rushing to your wallet! Your ancestors are smiling. Your enemies are confused.`,
      `🎰🎰🎰 天啊! HEAVENS ABOVE! THE DOUBLE 8 FORTUNE HAS MANIFESTED! 88x DIVINE MULTIPLIER! ${formatMON(r.payout)} MON materializing! 發發發! DOUBLE PROSPERITY!`,
    ];

    addMessage(responses[r.outcome]);
    setRevealing(null);
    setIsProcessing(false);
  };

  const amountValid = (() => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return null;
    if (val < 8) return false;
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
            {isConnected && balanceData && (
              <span
                style={{
                  fontSize: 12,
                  color: PALETTE.textMuted,
                  fontWeight: 600,
                }}
              >
                {parseFloat(balanceData.formatted).toFixed(2)} MON
              </span>
            )}
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
                <ChatMessage key={i} message={m.text} isBot={m.bot} />
              ))}
            </div>
          )}

          {tab === "history" && (
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
              {history.length === 0 ? (
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
              <RulesPanel />
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
              {SUGGESTED_AMOUNTS.map((a) => (
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
                Active — Win probabilities halved
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
          onDone={handleRevealDone}
        />
      )}
    </>
  );
}
