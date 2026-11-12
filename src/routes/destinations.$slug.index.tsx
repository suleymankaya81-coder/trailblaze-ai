import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { SITE_ORIGIN } from "@/config/site";
import { GeoDirectory } from "@/components/destination/GeoDirectory";
import { getCountryRegions, getDestinationGeo, type GeoRegion } from "@/lib/data/geo.functions";
import { COUNTRIES, countryPath, isCountry, regionPath } from "@/lib/routes/paths";
import { breadcrumbScript, countryCrumbs } from "@/lib/seo/breadcrumbs";
import { hreflangLinks } from "@/lib/seo/hreflang";

// /destinations/{country}: country directory. Older flat destination
// addresses (/destinations/{slug}) permanently redirect to the nested page.
export const Route = createFileRoute("/destinations/$slug/")({
  loader: async ({ params }): Promise<{ country: string; regions: GeoRegion[] }> => {
    if (!isCountry(params.slug)) {
      const geo = await getDestinationGeo({ data: { slug: params.slug } }).catch(() => null);
      if (geo) throw redirect({ href: `/destinations/${geo.country}/${geo.region}/${params.slug}`, statusCode: 301 });
      throw notFound();
    }
    const regions = await getCountryRegions({ data: { country: params.slug } });
    return { country: params.slug, regions };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Destination not found — MiniaLife" }, { name: "robots", content: "noindex" }] };
    const name = COUNTRIES[loaderData.country].name;
    const total = loaderData.regions.reduce((n, r) => n + r.count, 0);
    const title = `${name} National Parks & Road Trip Destinations by State`;
    const description = `Plan trips to ${total} ${name} parks and outdoor destinations across ${loaderData.regions.length} states: airports, rentals, itineraries and when to go.`;
    const url = `${SITE_ORIGIN}${countryPath(loaderData.country)}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }, ...hreflangLinks(countryPath(loaderData.country), ["en", "de"])],
      scripts: [breadcrumbScript(countryCrumbs(loaderData.country))],
    };
  },
  component: CountryPage,
  errorComponent: () => <p className="p-10 text-center">Something went wrong loading this page.</p>,
  notFoundComponent: () => <p className="p-10 text-center">Destination not found.</p>,
});

function CountryPage() {
  const { country, regions } = Route.useLoaderData();
  const name = COUNTRIES[country].name;
  return (
    <GeoDirectory
      kicker="Destinations"
      title={`${name} destinations by state`}
      intro="Pick a state to see its national parks, outdoor regions and road trip bases."
      crumbs={countryCrumbs(country)}
      heading="Browse by state"
      action="See destinations"
      image={regions[0]?.heroImage}
      items={regions.map((r) => ({ to: regionPath(country, r.slug), title: r.name, image: r.heroImage, info: `${r.count} destinations` }))}
    />
  );
}
