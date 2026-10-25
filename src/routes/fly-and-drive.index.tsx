import { createFileRoute } from "@tanstack/react-router";

import { GuideHub } from "@/components/guides/GuideHub";
import { getHubEntries } from "@/lib/data/guideHubs.functions";
import { SITE } from "@/lib/seo/flyDrive";
import { HUB_SEO } from "@/lib/seo/hubSeo";

const title = HUB_SEO.flyAndDrive.title;
const description = HUB_SEO.flyAndDrive.description;

export const Route = createFileRoute("/fly-and-drive/")({
  loader: () => getHubEntries({ data: { family: "fly-and-drive" } }),
  head: ({ loaderData }) => ({
    meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      ...((image => image?.startsWith("https://") ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : [])(loaderData?.find(e => e.heroImage)?.heroImage)),
      { property: "og:url", content: `${SITE}/fly-and-drive` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/fly-and-drive` }],
  }),
  component: () => <GuideHub family="fly-and-drive" kicker="Fly & Drive" title="Fly & drive guides" intro="Pick a place to see the closest airport, the drive time, car rental and the first night's stay." entries={Route.useLoaderData()} />,
});
