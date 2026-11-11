import { createFileRoute } from "@tanstack/react-router";
import { Route as En, BuilderPage } from "./trip-builder.$slug";
import { deHead } from "@/lib/i18n/deTemplate";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const en = En.options as any;
export const Route = createFileRoute("/de/trip-builder/$slug")({
  loader: (ctx) => en.loader(ctx),
  head: (ctx) => deHead(en.head?.(ctx)),
  component: BuilderPage,
});
