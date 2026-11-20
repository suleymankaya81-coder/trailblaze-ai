import { directoryLocales } from "@/lib/i18n/geoLocales";
import type { Locale } from "@/lib/i18n/locales";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { SITE_ORIGIN } from "@/config/site";
import { GeoDirectory } from "@/components/destination/GeoDirectory";
import { getCountryMapPlaces, getCountryRegions, getDestinationGeo, type GeoRegion } from "@/lib/data/geo.functions";
import type { CountryMapPlace } from "@/lib/routes/countryMap";
import { CountryExplorationMap } from "@/components/destination/CountryExplorationMap";
import { regionUnit, deIn, COUNTRIES, countryPath, isCountry, regionPath } from "@/lib/routes/paths";
import { breadcrumbScript } from "@/lib/seo/breadcrumbs";
import { deGeoCrumbs, deMeta } from "@/lib/i18n/deSeo";
import { hreflangLinks } from "@/lib/seo/hreflang";
import { getTranslatedDestinationSlugs } from "@/lib/data/geo.de.functions";
import { translatedCountryPlaces } from "@/lib/routes/translatedCountry";

// /de/destinations/{country}; older /de/destinations/{slug} addresses 301 to the nested page.
export const Route = createFileRoute("/de/destinations/$slug/")({
  loader: async ({ params }): Promise<{ country: string; regions: GeoRegion[]; places: CountryMapPlace[]; locales: Locale[] }> => {
    if (!isCountry(params.slug)) {
      const geo = await getDestinationGeo({ data: { slug: params.slug } }).catch(() => null);
      if (geo) throw redirect({ href: `/de/destinations/${geo.country}/${geo.region}/${params.slug}`, statusCode: 301 });
      throw notFound();
    }
    const regions = await getCountryRegions({ data: { country: params.slug } });
    if (regions.length === 0) throw notFound(); // Enabled country, nothing published yet: no empty page.
    const [allPlaces, translated] = await Promise.all([
      getCountryMapPlaces({ data: { country: params.slug } }),
      getTranslatedDestinationSlugs({ data: { locale: "de" } }),
    ]);
    const places = translatedCountryPlaces(allPlaces, translated);
    if (!places.length) throw redirect({ href: countryPath(params.slug), statusCode: 302 });
    const availableRegions = regions.map(region => ({
      ...region, count: places.filter(place => place.region === region.slug).length,
    })).filter(region => region.count > 0);
    return { country: params.slug, regions: availableRegions, places, locales: await directoryLocales(allPlaces.map((p) => p.slug)) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Nicht verfügbar — WildParkRoutes" }, { name: "robots", content: "noindex" }] };
    const name = COUNTRIES[loaderData.country].nameDe;
    const total = loaderData.regions.reduce((n, r) => n + r.count, 0);
    const u = regionUnit(loaderData.country);
    const title = `${name}: Nationalparks & Roadtrip-Ziele nach ${u.de}`;
    const description = `${total} Parks und Outdoor-Ziele ${deIn(loaderData.country, name)} in ${loaderData.regions.length} ${u.dePlural}: Flughäfen, Mietwagen, Reisepläne und beste Reisezeit.`;
    const url = `${SITE_ORIGIN}${countryPath(loaderData.country, "de")}`;
    return {
      meta: [...deMeta(title, description, url), { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData.regions[0]?.heroImage?.startsWith("https://") ? [
          { property: "og:image", content: loaderData.regions[0].heroImage },
          { name: "twitter:image", content: loaderData.regions[0].heroImage },
        ] : [])],
      links: [{ rel: "canonical", href: url }, ...hreflangLinks(countryPath(loaderData.country), loaderData.locales)],
      scripts: [breadcrumbScript(deGeoCrumbs(loaderData.country))],
    };
  },
  component: Page,
  errorComponent: () => <p className="p-10 text-center">Beim Laden ist ein Fehler aufgetreten.</p>,
  notFoundComponent: () => <p className="p-10 text-center">Reiseziel nicht gefunden.</p>,
});

function Page() {
  const { country, regions, places } = Route.useLoaderData();
  const name = COUNTRIES[country].nameDe;
  const u = regionUnit(country);
  return (
    <GeoDirectory
      kicker="Reiseziele"
      title={`Reiseziele ${deIn(country, name)} nach ${u.de}`}
      intro={`Nach ${u.de} sortiert: Nationalparks, Outdoor-Regionen und Roadtrip-Ausgangspunkte.`}
      crumbs={deGeoCrumbs(country)}
      heading={`Nach ${u.de}`}
      action="Reiseziele ansehen"
      image={regions[0]?.heroImage}
      items={regions.map((r) => ({ to: regionPath(country, r.slug, "de"), title: r.name, image: r.heroImage, info: `${r.count} Reiseziele` }))}
    ><CountryExplorationMap country={country} places={places} regions={regions} locale="de" /></GeoDirectory>
  );
}
