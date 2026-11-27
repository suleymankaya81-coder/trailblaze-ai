import { directoryLocales } from "@/lib/i18n/geoLocales";
import type { Locale } from "@/lib/i18n/locales";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { SITE_ORIGIN } from "@/config/site";
import { GeoDirectory } from "@/components/destination/GeoDirectory";
import { hubFacts, hubLead, type HubStats } from "@/lib/seo/hubSummary";
import { getCountryMapPlaces, getCountryRegions, getDestinationGeo, type GeoRegion, getHubStats } from "@/lib/data/geo.functions";
import type { CountryMapPlace } from "@/lib/routes/countryMap";
import { CountryExplorationMap } from "@/components/destination/CountryExplorationMap";
import { COUNTRIES, countryPath, isCountry, regionPath } from "@/lib/routes/paths";
import { breadcrumbScript } from "@/lib/seo/breadcrumbs";
import { frGeoCrumbs, frIn, frMeta } from "@/lib/i18n/frSeo";
import { hreflangLinks } from "@/lib/seo/hreflang";
import { getTranslatedDestinationSlugs } from "@/lib/data/geo.de.functions";
import { translatedCountryPlaces } from "@/lib/routes/translatedCountry";

// /fr/destinations/{country}; older /fr/destinations/{slug} addresses 301 to the nested page.
export const Route = createFileRoute("/fr/destinations/$slug/")({
  loader: async ({ params }): Promise<{ country: string; regions: GeoRegion[]; places: CountryMapPlace[]; locales: Locale[]; hub: { stats: HubStats; intro: string | null } }> => {
    if (!isCountry(params.slug)) {
      const geo = await getDestinationGeo({ data: { slug: params.slug } }).catch(() => null);
      if (geo) throw redirect({ href: `/fr/destinations/${geo.country}/${geo.region}/${params.slug}`, statusCode: 301 });
      throw notFound();
    }
    const regions = await getCountryRegions({ data: { country: params.slug } });
    if (regions.length === 0) throw notFound(); // Enabled country, nothing published yet: no empty page.
    const [allPlaces, translated] = await Promise.all([
      getCountryMapPlaces({ data: { country: params.slug } }),
      getTranslatedDestinationSlugs({ data: { locale: "fr" } }),
    ]);
    const places = translatedCountryPlaces(allPlaces, translated);
    if (!places.length) throw redirect({ href: countryPath(params.slug), statusCode: 302 });
    const availableRegions = regions.map(region => ({
      ...region, count: places.filter(place => place.region === region.slug).length,
    })).filter(region => region.count > 0);
    const hub = await getHubStats({ data: { country: params.slug, locale: "fr" } });
    return { country: params.slug, regions: availableRegions, places, locales: await directoryLocales(allPlaces.map((p) => p.slug)), hub };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Indisponible — WildParkRoutes" }, { name: "robots", content: "noindex" }] };
    const name = COUNTRIES[loaderData.country].nameFr;
    const total = loaderData.regions.reduce((n, r) => n + r.count, 0);
    const title = `${name} : parcs nationaux & idées de road trip par région`;
    const description = `${total} parcs et sites nature ${frIn(loaderData.country)}, dans ${loaderData.regions.length} régions : aéroports, location de voiture, itinéraires et meilleure saison.`;
    const url = `${SITE_ORIGIN}${countryPath(loaderData.country, "fr")}`;
    return {
      meta: [...frMeta(title, description, url), { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData.regions[0]?.heroImage?.startsWith("https://") ? [
          { property: "og:image", content: loaderData.regions[0].heroImage },
          { name: "twitter:image", content: loaderData.regions[0].heroImage },
        ] : [])],
      links: [{ rel: "canonical", href: url }, ...hreflangLinks(countryPath(loaderData.country), loaderData.locales)],
      scripts: [breadcrumbScript(frGeoCrumbs(loaderData.country))],
    };
  },
  component: Page,
  errorComponent: () => <p className="p-10 text-center">Une erreur est survenue lors du chargement.</p>,
  notFoundComponent: () => <p className="p-10 text-center">Destination introuvable.</p>,
});

function Page() {
  const { country, regions, places , hub } = Route.useLoaderData();
  return (
    <GeoDirectory
      lead={hubLead(COUNTRIES[country].nameFr, hub.stats, "fr", hub.intro)}
      facts={hubFacts(hub.stats, "fr")}
      factsHeading="En bref"
      kicker="Destinations"
      title={`Destinations ${frIn(country)} par région`}
      intro="Classés par région : parcs nationaux, régions nature et points de départ de road trips."
      crumbs={frGeoCrumbs(country)}
      heading="Par région"
      action="Voir les destinations"
      image={regions[0]?.heroImage}
      items={regions.map((r) => ({ to: regionPath(country, r.slug, "fr"), title: r.name, image: r.heroImage, info: `${r.count} destinations` }))}
    ><CountryExplorationMap country={country} places={places} regions={regions} locale="fr" /></GeoDirectory>
  );
}
