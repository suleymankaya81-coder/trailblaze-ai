import { createFileRoute, notFound } from "@tanstack/react-router";
import { SITE_ORIGIN } from "@/config/site";
import { GeoDirectory } from "@/components/destination/GeoDirectory";
import { getRegionPlaces, type GeoPlace } from "@/lib/data/geo.functions";
import { COUNTRIES, destinationPath, isCountry, regionPath } from "@/lib/routes/paths";
import { breadcrumbScript, regionCrumbs } from "@/lib/seo/breadcrumbs";
import { hreflangLinks } from "@/lib/seo/hreflang";

// /destinations/{country}/{region}: all published destinations in one state/region.
export const Route = createFileRoute("/destinations/$slug/$region/")({
  loader: async ({ params }): Promise<{ country: string; region: string; name: string; places: GeoPlace[] }> => {
    if (!isCountry(params.slug)) throw notFound();
    const data = await getRegionPlaces({ data: { country: params.slug, region: params.region } });
    if (!data) throw notFound();
    return { country: params.slug, region: params.region, ...data };
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
      links: [{ rel: "canonical", href: url }, ...hreflangLinks(regionPath(country, region), ["en", "de"])],
      scripts: [breadcrumbScript(regionCrumbs(country, region, name))],
    };
  },
  component: RegionPage,
  errorComponent: () => <p className="p-10 text-center">Something went wrong loading this page.</p>,
  notFoundComponent: () => <p className="p-10 text-center">Region not found.</p>,
});

function RegionPage() {
  const { country, region, name, places } = Route.useLoaderData();
  return (
    <GeoDirectory
      kicker={COUNTRIES[country].name}
      title={`${name} destinations`}
      intro={`National parks, outdoor regions and road trip bases in ${name}, each with airports, rentals and a day-by-day plan.`}
      crumbs={regionCrumbs(country, region, name)}
      heading="Destinations"
      action="See the plan"
      image={places.find((p) => p.heroImage)?.heroImage}
      items={places.map((p) => ({ to: destinationPath(p.slug), title: p.name, image: p.heroImage, summary: p.tagline, info: p.bestSeason }))}
    />
  );
}
