import { SITE_ORIGIN } from "@/config/site";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { travelDescription } from "@/lib/seo/travelMetadata";
import { DestinationPageView } from "@/components/destination/DestinationPageView";
import { getDestinationPageData, type DestinationView } from "@/lib/data/destinations.functions";
import { getDestinationTranslation, type DestinationTranslation } from "@/lib/data/translations.functions";
import { getLandingLinksForDestination, type LandingLink } from "@/lib/data/landingPages.functions";
import { DESTINATIONS_DE, HOME_DE, deMeta } from "@/lib/i18n/deSeo";
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

export const Route = createFileRoute("/de/destinations/$slug")({
  loader: async ({ params }): Promise<{ dest: DestinationView; tr: DestinationTranslation; landingLinks: LandingLink[] }> => {
    const [tr, dest] = await Promise.all([
      getDestinationTranslation({ data: { slug: params.slug, locale: "de" } }),
      getDestinationPageData({ data: { slug: params.slug } }),
    ]);
    if (!tr || !dest) throw notFound();
    const landingLinks = await getLandingLinksForDestination({ data: { destinationId: dest.id } }).catch(() => []);
    return { dest: translateDest(dest, tr), tr, landingLinks };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Nicht verfügbar — MiniaLife" }, { name: "robots", content: "noindex" }] };
    const { tr, dest } = loaderData;
    const url = `${SITE_ORIGIN}/de/destinations/${dest.slug}`;
    const crumbs = [HOME_DE, DESTINATIONS_DE, { name: tr.name, path: `/de/destinations/${dest.slug}` }];
    return {
      meta: [
        ...deMeta(tr.metaTitle, travelDescription(dest, "destination", tr.metaDescription, "de"), url),
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(dest.heroImage.startsWith("https://") ? [{ property: "og:image", content: dest.heroImage }, { name: "twitter:image", content: dest.heroImage }] : []),
      ],
      links: [{ rel: "canonical", href: url }, ...hreflangLinks(`/destinations/${dest.slug}`, ["en", "de"])],
      scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", ...breadcrumbJsonLd(crumbs) }).replace(/</g, "\\u003c") }],
    };
  },
  component: Page,
});

function Page() {
  const { dest, tr, landingLinks } = Route.useLoaderData();
  const crumbs = [HOME_DE, DESTINATIONS_DE, { name: tr.name, path: `/de/destinations/${dest.slug}` }];
  return <DestinationPageView dest={dest} landingLinks={landingLinks} crumbs={crumbs} />;
}
