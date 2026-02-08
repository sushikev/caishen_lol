import type { Metadata } from "next";
import ClientProviders from "./client-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "財神 Bot — Red Envelope Roulette",
  description: "CáiShén Bot - Red Envelope Roulette AI Agent on Monad",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧧</text></svg>",
  },
  other: {
    "theme-color": "#DC143C",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&family=Noto+Serif+SC:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
