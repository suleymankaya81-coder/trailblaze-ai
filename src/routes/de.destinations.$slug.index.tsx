import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { SITE_ORIGIN } from "@/config/site";
import { GeoDirectory } from "@/components/destination/GeoDirectory";
import { getCountryRegions, getDestinationGeo, type GeoRegion } from "@/lib/data/geo.functions";
import { regionUnit, deIn, COUNTRIES, countryPath, isCountry, regionPath } from "@/lib/routes/paths";
import { breadcrumbScript } from "@/lib/seo/breadcrumbs";
import { deGeoCrumbs, deMeta } from "@/lib/i18n/deSeo";
import { hreflangLinks } from "@/lib/seo/hreflang";

// /de/destinations/{country}; older /de/destinations/{slug} addresses 301 to the nested page.
export const Route = createFileRoute("/de/destinations/$slug/")({
  loader: async ({ params }): Promise<{ country: string; regions: GeoRegion[] }> => {
    if (!isCountry(params.slug)) {
      const geo = await getDestinationGeo({ data: { slug: params.slug } }).catch(() => null);
      if (geo) throw redirect({ href: `/de/destinations/${geo.country}/${geo.region}/${params.slug}`, statusCode: 301 });
      throw notFound();
    }
    const regions = await getCountryRegions({ data: { country: params.slug } });
    if (regions.length === 0) throw notFound(); // Enabled country, nothing published yet: no empty page.
    return { country: params.slug, regions };
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
      meta: [...deMeta(title, description, url), { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }],
      links: [{ rel: "canonical", href: url }, ...hreflangLinks(countryPath(loaderData.country), ["en", "de"])],
      scripts: [breadcrumbScript(deGeoCrumbs(loaderData.country))],
    };
  },
  component: Page,
  errorComponent: () => <p className="p-10 text-center">Beim Laden ist ein Fehler aufgetreten.</p>,
  notFoundComponent: () => <p className="p-10 text-center">Reiseziel nicht gefunden.</p>,
});

function Page() {
  const { country, regions } = Route.useLoaderData();
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
    />
  );
}
