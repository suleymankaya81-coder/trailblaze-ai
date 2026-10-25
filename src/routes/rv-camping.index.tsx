import { createFileRoute } from "@tanstack/react-router";

import { GuideHub } from "@/components/guides/GuideHub";
import { getHubEntries } from "@/lib/data/guideHubs.functions";
import { SITE } from "@/lib/seo/flyDrive";
import { HUB_SEO } from "@/lib/seo/hubSeo";

const title = HUB_SEO.rvCamping.title;
const description = HUB_SEO.rvCamping.description;

export const Route = createFileRoute("/rv-camping/")({
  loader: () => getHubEntries({ data: { family: "rv-camping" } }),
  head: ({ loaderData }) => ({
    meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      ...((image => image?.startsWith("https://") ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : [])(loaderData?.find(e => e.heroImage)?.heroImage)),
      { property: "og:url", content: `${SITE}/rv-camping` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/rv-camping` }],
  }),
  component: () => <GuideHub family="rv-camping" kicker="RV & Camping" title="RV & camping guides" intro="Places that work well by RV or campervan, with campgrounds, RV parks and rental options." entries={Route.useLoaderData()} />,
});
