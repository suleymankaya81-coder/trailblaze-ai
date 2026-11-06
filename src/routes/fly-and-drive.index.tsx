import type * as React from "react";
import { deAlternates } from "@/lib/i18n/deTemplate";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";

import { GuideHub } from "@/components/guides/GuideHub";
import { getHubEntries } from "@/lib/data/guideHubs.functions";
import { SITE } from "@/lib/seo/flyDrive";
import { HUB_SEO } from "@/lib/seo/hubSeo";
import { breadcrumbScript, hubCrumbs } from "@/lib/seo/breadcrumbs";

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
    links: [{ rel: "canonical", href: `${SITE}/fly-and-drive` }, ...deAlternates(`${SITE}/fly-and-drive`)],
    scripts: [breadcrumbScript(hubCrumbs("Fly & drive guides", "/fly-and-drive"))],
  }),
  component: HubPage,
});

export function HubPage(): React.ReactElement {
  return <GuideHub family="fly-and-drive" kicker="Fly & Drive" title="Fly & drive guides" intro="Pick a place to see the closest airport, the drive time, car rental and the first night's stay." entries={(useLoaderData({ strict: false }) as ReturnType<typeof Route.useLoaderData>)} />;
}
