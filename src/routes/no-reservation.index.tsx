import { createFileRoute } from "@tanstack/react-router";

import { GuideHub } from "@/components/guides/GuideHub";
import { getHubEntries } from "@/lib/data/guideHubs.functions";
import { SITE } from "@/lib/seo/flyDrive";
import { HUB_SEO } from "@/lib/seo/hubSeo";

const title = HUB_SEO.noReservation.title;
const description = HUB_SEO.noReservation.description;

export const Route = createFileRoute("/no-reservation/")({
  loader: () => getHubEntries({ data: { family: "no-reservation" } }),
  head: ({ loaderData }) => ({
    meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      ...((image => image?.startsWith("https://") ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : [])(loaderData?.find(e => e.heroImage)?.heroImage)),
      { property: "og:url", content: `${SITE}/no-reservation` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/no-reservation` }],
  }),
  component: () => <GuideHub family="no-reservation" kicker="No Reservation" title="No reservation? Entry rules & backup plans" intro="Places where booking matters — what the rules are, how to get in without a reservation, and where to go instead." entries={Route.useLoaderData()} />,
});
