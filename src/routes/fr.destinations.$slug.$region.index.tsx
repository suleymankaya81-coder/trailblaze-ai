import { directoryLocales } from "@/lib/i18n/geoLocales";
import type { Locale } from "@/lib/i18n/locales";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { SITE_ORIGIN } from "@/config/site";
import { GeoDirectory } from "@/components/destination/GeoDirectory";
import { getRegionPlaces, type GeoPlace } from "@/lib/data/geo.functions";
import { getTranslatedDestinationSlugs } from "@/lib/data/geo.de.functions";
import { COUNTRIES, destinationPath, isCountry, regionPath } from "@/lib/routes/paths";
import { breadcrumbScript } from "@/lib/seo/breadcrumbs";
import { frGeoCrumbs, frMeta } from "@/lib/i18n/frSeo";
import { hreflangLinks } from "@/lib/seo/hreflang";

// /fr/destinations/{country}/{region}: French region directory (only places with a published French page).
export const Route = createFileRoute("/fr/destinations/$slug/$region/")({
  loader: async ({ params }): Promise<{ country: string; region: string; name: string; places: GeoPlace[]; locales: Locale[] }> => {
    if (!isCountry(params.slug)) throw notFound();
    const [data, translated] = await Promise.all([
      getRegionPlaces({ data: { country: params.slug, region: params.region } }),
      getTranslatedDestinationSlugs({ data: { locale: "fr" } }),
    ]);
    if (!data) throw notFound();
    const places = data.places.filter((p) => translated.includes(p.slug));
    if (!places.length) throw redirect({ href: regionPath(params.slug, params.region), statusCode: 302 });
    return { country: params.slug, region: params.region, name: data.name, places, locales: await directoryLocales(data.places.map((p) => p.slug)) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Indisponible — WildParkRoutes" }, { name: "robots", content: "noindex" }] };
    const { name, places, country, region, locales } = loaderData;
    const title = `${name} : parcs nationaux & nature – ${places.length} destinations`;
    const description = `Guides de road trip et de parcs pour ${name} (${COUNTRIES[country].nameFr}) : ${places.slice(0, 4).map((p) => p.name).join(", ")} et plus.`.slice(0, 160);
    const url = `${SITE_ORIGIN}${regionPath(country, region, "fr")}`;
    return {
      meta: [...frMeta(title, description, url), { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }],
      links: [{ rel: "canonical", href: url }, ...hreflangLinks(regionPath(country, region), locales)],
      scripts: [breadcrumbScript(frGeoCrumbs(country, { slug: region, name }))],
    };
  },
  component: Page,
  errorComponent: () => <p className="p-10 text-center">Une erreur est survenue lors du chargement.</p>,
  notFoundComponent: () => <p className="p-10 text-center">Région introuvable.</p>,
});

function Page() {
  const { country, region, name, places } = Route.useLoaderData();
  return (
    <GeoDirectory
      kicker={COUNTRIES[country].nameFr}
      title={`Destinations : ${name}`}
      intro={`Parcs nationaux, régions nature et points de départ de road trips : ${name} – avec aéroport, location de voiture et itinéraire jour par jour.`}
      crumbs={frGeoCrumbs(country, { slug: region, name })}
      heading="Destinations"
      action="Voir l'itinéraire"
      image={places.find((p) => p.heroImage)?.heroImage}
      items={places.map((p) => ({ to: destinationPath(p.slug, "fr"), title: p.name, image: p.heroImage, summary: p.tagline, info: p.bestSeason }))}
    />
  );
}
