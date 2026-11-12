import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { SITE_ORIGIN } from "@/config/site";
import { GeoDirectory } from "@/components/destination/GeoDirectory";
import { getCountryRegions, getDestinationGeo, type GeoRegion } from "@/lib/data/geo.functions";
import { COUNTRIES, countryPath, isCountry, regionPath } from "@/lib/routes/paths";
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
    return { country: params.slug, regions: await getCountryRegions({ data: { country: params.slug } }) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Nicht verfügbar — WildParkRoutes" }, { name: "robots", content: "noindex" }] };
    const name = COUNTRIES[loaderData.country].nameDe;
    const total = loaderData.regions.reduce((n, r) => n + r.count, 0);
    const title = `${name}: Nationalparks & Roadtrip-Ziele nach Bundesstaat`;
    const description = `${total} Parks und Outdoor-Ziele in ${loaderData.regions.length} Bundesstaaten der ${name}: Flughäfen, Mietwagen, Reisepläne und beste Reisezeit.`;
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
  return (
    <GeoDirectory
      kicker="Reiseziele"
      title={`Reiseziele in den ${name} nach Bundesstaat`}
      intro="Wähle einen Bundesstaat und entdecke Nationalparks, Outdoor-Regionen und Roadtrip-Ausgangspunkte."
      crumbs={deGeoCrumbs(country)}
      heading="Nach Bundesstaat"
      action="Reiseziele ansehen"
      image={regions[0]?.heroImage}
      items={regions.map((r) => ({ to: regionPath(country, r.slug, "de"), title: r.name, image: r.heroImage, info: `${r.count} Reiseziele` }))}
    />
  );
}
