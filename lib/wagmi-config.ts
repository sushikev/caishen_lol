import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { monad, monadTestnet } from "viem/chains";

export const config = getDefaultConfig({
  appName: "CaiShen Bot",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [monad, monadTestnet],
  ssr: true,
});
