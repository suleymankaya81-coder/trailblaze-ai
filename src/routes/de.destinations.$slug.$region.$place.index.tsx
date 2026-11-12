import { SITE_ORIGIN } from "@/config/site";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { destinationPath } from "@/lib/routes/paths";
import { getDestinationGeo } from "@/lib/data/geo.functions";
import { travelDescription } from "@/lib/seo/travelMetadata";
import { DestinationPageView } from "@/components/destination/DestinationPageView";
import { getDestinationPageData, type DestinationView } from "@/lib/data/destinations.functions";
import { getDestinationTranslation, type DestinationTranslation } from "@/lib/data/translations.functions";
import { getLandingLinksForDestination, type LandingLink } from "@/lib/data/landingPages.functions";
import { deGeoCrumbs, deMeta } from "@/lib/i18n/deSeo";
import { destinationGeo } from "@/lib/routes/paths";
import { regionName } from "@/lib/seo/breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { hreflangLinks } from "@/lib/seo/hreflang";

/** Overlay stored German text onto the full English page data; layout, photos and partners stay identical. */
function translateDest(dest: DestinationView, tr: DestinationTranslation): DestinationView {
  const plan = dest.travelPlan;
  const travelPlan = plan && tr.days.length === plan.days.length && tr.intel.length === plan.intel.length
    ? {
        ...plan,
        days: plan.days.map((d, i) => ({ ...d, ...tr.days[i], stops: d.stops.map((s, j) => ({ ...s, ...(tr.days[i].stops[j] ?? {}), routingName: s.name })) })),
        intel: plan.intel.map((x, i) => ({ ...x, title: tr.intel[i].title, text: tr.intel[i].text })),
        arrival: tr.arrival ?? plan.arrival,
        vehicle: tr.vehicle ?? plan.vehicle,
        goldenHour: tr.goldenHour ?? plan.goldenHour,
      }
    : plan;
  return {
    ...dest,
    name: tr.name || dest.name,
    region: tr.region ?? dest.region,
    tagline: tr.tagline ?? dest.tagline,
    bestSeason: tr.bestSeason ?? dest.bestSeason,
    permitHeadline: tr.permitHeadline ?? dest.permitHeadline,
    permitNote: tr.permitNote ?? dest.permitNote,
    travelPlan,
  } as DestinationView;
}

export const Route = createFileRoute("/de/destinations/$slug/$region/$place/")({
  loader: async ({ params }): Promise<{ dest: DestinationView; tr: DestinationTranslation; landingLinks: LandingLink[] }> => {
    const [tr, dest, geo] = await Promise.all([
      getDestinationTranslation({ data: { slug: params.place, locale: "de" } }),
      getDestinationPageData({ data: { slug: params.place } }),
      getDestinationGeo({ data: { slug: params.place } }).catch(() => null),
    ]);
    if (!tr || !dest || !geo) throw notFound();
    if (geo.country !== params.slug || geo.region !== params.region) {
      throw redirect({ href: `/de/destinations/${geo.country}/${geo.region}/${dest.slug}`, statusCode: 301 });
    }
    const landingLinks = await getLandingLinksForDestination({ data: { destinationId: dest.id } }).catch(() => []);
    return { dest: translateDest(dest, tr), tr, landingLinks };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Nicht verfügbar — WildParkRoutes" }, { name: "robots", content: "noindex" }] };
    const { tr, dest } = loaderData;
    const url = `${SITE_ORIGIN}${destinationPath(dest.slug, "de")}`;
    const crumbs = placeCrumbsDe(dest.slug, tr.name);
    return {
      meta: [
        ...deMeta(tr.metaTitle, travelDescription(dest, "destination", tr.metaDescription, "de"), url),
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(dest.heroImage.startsWith("https://") ? [{ property: "og:image", content: dest.heroImage }, { name: "twitter:image", content: dest.heroImage }] : []),
      ],
      links: [{ rel: "canonical", href: url }, ...hreflangLinks(destinationPath(dest.slug), ["en", "de"])],
      scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", ...breadcrumbJsonLd(crumbs) }).replace(/</g, "\\u003c") }],
    };
  },
  component: Page,
});

function Page() {
  const { dest, tr, landingLinks } = Route.useLoaderData();
  const crumbs = placeCrumbsDe(dest.slug, tr.name);
  return <DestinationPageView dest={dest} landingLinks={landingLinks} crumbs={crumbs} />;
}

function placeCrumbsDe(slug: string, name: string) {
  const g = destinationGeo(slug);
  const parents = g ? deGeoCrumbs(g.country, { slug: g.region, name: regionName(g.region) }) : deGeoCrumbs("us").slice(0, 2);
  return [...parents, { name, path: destinationPath(slug, "de") }];
}
