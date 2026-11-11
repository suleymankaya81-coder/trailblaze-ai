import { createFileRoute } from "@tanstack/react-router";
import { Route as En, Page } from "./road-trips.$slug";
import { deHead } from "@/lib/i18n/deTemplate";
import { germanTravelHead } from "@/lib/seo/travelMetadata";
import { suggestedDays } from "@/lib/seo/guides";

// German version reuses the English template; fixed wording switches via <T>/tp().
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const en = En.options as any;
export const Route = createFileRoute("/de/road-trips/$slug")({
  loader: (ctx) => en.loader(ctx),
  head: (ctx) => {
    const data = ctx.loaderData;
    return data ? germanTravelHead(deHead(en.head?.(ctx)), { name: data.loop.title, region: data.loop.region, tripDurationDays: `${data.stops.reduce((sum: number, s: { tripDurationDays: string | null }) => sum + suggestedDays(s.tripDurationDays), 0)} days` }, "road-trips") : deHead(en.head?.(ctx));
  },
  component: Page,
});
