import { createFileRoute } from "@tanstack/react-router";

import { GuideHub } from "@/components/guides/GuideHub";
import { getHubEntries } from "@/lib/data/guideHubs.functions";
import { SITE } from "@/lib/seo/flyDrive";

const title = "RV & Camping Guides by Destination — MiniaLife";
const description = "Campgrounds, RV parks, hookups and campervan rentals for the best RV-friendly national parks and outdoor towns in the USA.";

export const Route = createFileRoute("/rv-camping/")({
  loader: () => getHubEntries({ data: { family: "rv-camping" } }),
  head: () => ({
    meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/rv-camping` }],
  }),
  component: () => <GuideHub family="rv-camping" kicker="RV & Camping" title="RV & camping guides" intro="Places that work well by RV or campervan, with campgrounds, RV parks and rental options." entries={Route.useLoaderData()} />,
});
