import { createFileRoute } from "@tanstack/react-router";
import { Route as En, FlyDrivePage } from "./fly-and-drive.$slug";
import { deHead } from "@/lib/i18n/deTemplate";

// German version reuses the English template; fixed wording switches via <T>/tp().
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const en = En.options as any;
export const Route = createFileRoute("/de/fly-and-drive/$slug")({
  loader: (ctx) => en.loader(ctx),
  head: (ctx) => deHead(en.head?.(ctx)),
  component: FlyDrivePage,
});
