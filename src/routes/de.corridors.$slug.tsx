import { createFileRoute } from "@tanstack/react-router";
import { Route as En, Page } from "./corridors.$slug";
import { deHead } from "@/lib/i18n/deTemplate";
import { germanTravelHead } from "@/lib/seo/travelMetadata";

// German version reuses the English template; fixed wording switches via <T>/tp().
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const en = En.options as any;
export const Route = createFileRoute("/de/corridors/$slug")({
  loader: (ctx) => en.loader(ctx),
  head: (ctx) => {
    const c = ctx.loaderData?.corridor;
    return c ? germanTravelHead(deHead(en.head?.(ctx)), { name: c.title, region: `${c.gatewayCity} (${c.gateway.code})`, tripDurationDays: c.idealDays }, "corridors") : deHead(en.head?.(ctx));
  },
  component: Page,
});
