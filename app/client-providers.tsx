"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const Providers = dynamic(
  () => import("./providers").then((m) => m.Providers),
  { ssr: false }
);

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
