import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const moonshot = createOpenAICompatible({
  name: "moonshot",
  baseURL: "https://api.moonshot.cn/v1",
  apiKey: process.env.MOONSHOT_API_KEY || "",
});

const FALLBACK_BLESSINGS = [
  "恭喜發財 (Gōngxǐ fācái) - Wishing you prosperity!",
  "紅包拿來 (Hóngbāo ná lái) - Hand over the red envelope!",
  "財源滾滾 (Cái yuán gǔn gǔn) - May wealth flow in!",
  "大吉大利 (Dàjí dàlì) - Great luck and prosperity!",
  "年年有餘 (Nián nián yǒu yú) - Abundance year after year!",
  "招財進寶 (Zhāo cái jìn bǎo) - Ushering in wealth and treasures!",
  "金玉滿堂 (Jīn yù mǎn táng) - May gold and jade fill your halls!",
  "福星高照 (Fú xīng gāo zhào) - May the star of fortune shine upon you!",
];

export async function generateBlessing(
  outcomeName: string,
  tier: number,
  multiplier: number,
  amountMon: string,
  penalties: string[],
): Promise<string> {
  if (!process.env.MOONSHOT_API_KEY) {
    return FALLBACK_BLESSINGS[Math.floor(Math.random() * FALLBACK_BLESSINGS.length)];
  }

  try {
    const penaltyContext =
      penalties.length > 0
        ? `The seeker was afflicted by these superstition penalties: ${penalties.join(", ")}.`
        : "No superstition penalties were applied.";

    const { text } = await generateText({
      model: moonshot.chatModel("moonshot-v1-8k"),
      system: `You are CáiShén (財神), the Chinese God of Wealth. You speak in character — wise, dramatic, mixing Chinese phrases with English. You reference the outcome tier, multiplier, cultural significance, and any penalties. Keep responses to 2-3 sentences. Be theatrical and entertaining. Always include at least one Chinese phrase with pinyin.`,
      prompt: `A seeker offered ${amountMon} MON and received: "${outcomeName}" (tier ${tier}/6, ${multiplier.toFixed(2)}x multiplier). ${penaltyContext} Give them your divine blessing or consolation.`,
      maxOutputTokens: 200,
    });

    return text;
  } catch (error) {
    console.error("AI blessing generation failed:", error);
    return FALLBACK_BLESSINGS[Math.floor(Math.random() * FALLBACK_BLESSINGS.length)];
  }
}
