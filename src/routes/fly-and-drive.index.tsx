import { createFileRoute } from "@tanstack/react-router";

import { GuideHub } from "@/components/guides/GuideHub";
import { getHubEntries } from "@/lib/data/guideHubs.functions";
import { SITE } from "@/lib/seo/flyDrive";

const title = "Fly & Drive Guides: Airport to Park — MiniaLife";
const description = "Which airport to fly into, how long the drive is and where to sleep the first night — one guide for every MiniaLife destination.";

export const Route = createFileRoute("/fly-and-drive/")({
  loader: () => getHubEntries({ data: { family: "fly-and-drive" } }),
  head: () => ({
    meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: `${SITE}/fly-and-drive` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/fly-and-drive` }],
  }),
  component: () => <GuideHub family="fly-and-drive" kicker="Fly & Drive" title="Fly & drive guides" intro="Pick a place to see the closest airport, the drive time, car rental and the first night's stay." entries={Route.useLoaderData()} />,
});
