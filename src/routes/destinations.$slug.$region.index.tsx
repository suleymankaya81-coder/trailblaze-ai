import { directoryLocales } from "@/lib/i18n/geoLocales";
import { genuineSeason } from "@/lib/seo/season";
import type { Locale } from "@/lib/i18n/locales";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { SITE_ORIGIN } from "@/config/site";
import { GeoDirectory } from "@/components/destination/GeoDirectory";
import { hubFacts, hubLead, type HubStats } from "@/lib/seo/hubSummary";
import { getRegionPlaces, type GeoPlace, getHubStats } from "@/lib/data/geo.functions";
import { COUNTRIES, destinationPath, isCountry, regionPath } from "@/lib/routes/paths";
import { breadcrumbScript, regionCrumbs } from "@/lib/seo/breadcrumbs";
import { hreflangLinks } from "@/lib/seo/hreflang";

// /destinations/{country}/{region}: all published destinations in one state/region.
export const Route = createFileRoute("/destinations/$slug/$region/")({
  loader: async ({ params }): Promise<{ country: string; region: string; name: string; places: GeoPlace[]; locales: Locale[]; hub: { stats: HubStats; intro: string | null } }> => {
    if (!isCountry(params.slug)) throw notFound();
    const data = await getRegionPlaces({ data: { country: params.slug, region: params.region } });
    if (!data) throw notFound();
    const hub = await getHubStats({ data: { country: params.slug, region: params.region, locale: "en" } });
    return { country: params.slug, region: params.region, ...data, locales: await directoryLocales(data.places.map((p) => p.slug)), hub };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Region not found — WildParkRoutes" }, { name: "robots", content: "noindex" }] };
    const { name, places, country, region } = loaderData;
    const title = `${name} National Parks & Outdoor Trips: ${places.length} Destinations`;
    const description = `Road trip and park guides for ${name}, ${COUNTRIES[country].name}: ${places.slice(0, 4).map((p) => p.name).join(", ")} and more — airports, rentals and when to go.`.slice(0, 160);
    const url = `${SITE_ORIGIN}${regionPath(country, region)}`;
    const image = places.find((p) => p.heroImage.startsWith("https://"))?.heroImage;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: url }, ...hreflangLinks(regionPath(country, region), loaderData.locales)],
      scripts: [breadcrumbScript(regionCrumbs(country, region, name))],
    };
  },
  component: RegionPage,
  errorComponent: () => <p className="p-10 text-center">Something went wrong loading this page.</p>,
  notFoundComponent: () => <p className="p-10 text-center">Region not found.</p>,
});

function RegionPage() {
  const { country, region, name, places , hub } = Route.useLoaderData();
  return (
    <GeoDirectory
      lead={hubLead(name, hub.stats, "en", hub.intro)}
      facts={hubFacts(hub.stats, "en")}
      factsHeading="At a glance"
      kicker={COUNTRIES[country].name}
      title={`${name} destinations`}
      intro={`National parks, outdoor regions and road trip bases in ${name}, each with airports, rentals and a day-by-day plan.`}
      crumbs={regionCrumbs(country, region, name)}
      heading="Destinations"
      action="See the plan"
      image={places.find((p) => p.heroImage)?.heroImage}
      items={places.map((p) => ({ to: destinationPath(p.slug), title: p.name, image: p.heroImage, summary: p.tagline, info: genuineSeason(p.bestSeason) }))}
    />
  );
}
