import { createFileRoute, notFound } from "@tanstack/react-router";
import { SITE_ORIGIN } from "@/config/site";
import { GeoDirectory } from "@/components/destination/GeoDirectory";
import { getRegionPlaces, type GeoPlace } from "@/lib/data/geo.functions";
import { getTranslatedDestinationSlugs } from "@/lib/data/geo.de.functions";
import { COUNTRIES, destinationPath, isCountry, regionPath } from "@/lib/routes/paths";
import { breadcrumbScript } from "@/lib/seo/breadcrumbs";
import { deGeoCrumbs, deMeta } from "@/lib/i18n/deSeo";
import { hreflangLinks } from "@/lib/seo/hreflang";

// /de/destinations/{country}/{region}: German state directory (only places with a published German page).
export const Route = createFileRoute("/de/destinations/$slug/$region/")({
  loader: async ({ params }): Promise<{ country: string; region: string; name: string; places: GeoPlace[] }> => {
    if (!isCountry(params.slug)) throw notFound();
    const [data, translated] = await Promise.all([
      getRegionPlaces({ data: { country: params.slug, region: params.region } }),
      getTranslatedDestinationSlugs({ data: { locale: "de" } }),
    ]);
    if (!data) throw notFound();
    const places = data.places.filter((p) => translated.includes(p.slug));
    if (!places.length) throw notFound();
    return { country: params.slug, region: params.region, name: data.name, places };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Nicht verfügbar — MiniaLife" }, { name: "robots", content: "noindex" }] };
    const { name, places, country, region } = loaderData;
    const title = `${name}: Nationalparks & Outdoor-Reisen – ${places.length} Reiseziele`;
    const description = `Roadtrip- und Parkführer für ${name} (${COUNTRIES[country].nameDe}): ${places.slice(0, 4).map((p) => p.name).join(", ")} und mehr.`.slice(0, 160);
    const url = `${SITE_ORIGIN}${regionPath(country, region, "de")}`;
    return {
      meta: [...deMeta(title, description, url), { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }],
      links: [{ rel: "canonical", href: url }, ...hreflangLinks(regionPath(country, region), ["en", "de"])],
      scripts: [breadcrumbScript(deGeoCrumbs(country, { slug: region, name }))],
    };
  },
  component: Page,
  errorComponent: () => <p className="p-10 text-center">Beim Laden ist ein Fehler aufgetreten.</p>,
  notFoundComponent: () => <p className="p-10 text-center">Region nicht gefunden.</p>,
});

function Page() {
  const { country, region, name, places } = Route.useLoaderData();
  return (
    <GeoDirectory
      kicker={COUNTRIES[country].nameDe}
      title={`Reiseziele in ${name}`}
      intro={`Nationalparks, Outdoor-Regionen und Roadtrip-Ausgangspunkte in ${name} – jeweils mit Flughafen, Mietwagen und Tagesplan.`}
      crumbs={deGeoCrumbs(country, { slug: region, name })}
      heading="Reiseziele"
      action="Zum Reiseplan"
      image={places.find((p) => p.heroImage)?.heroImage}
      items={places.map((p) => ({ to: destinationPath(p.slug, "de"), title: p.name, image: p.heroImage, summary: p.tagline, info: p.bestSeason }))}
    />
  );
}
