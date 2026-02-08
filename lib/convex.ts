import { ConvexHttpClient } from "convex/browser";

export function getConvexClient() {
  return new ConvexHttpClient(process.env.CONVEX_URL!);
}
