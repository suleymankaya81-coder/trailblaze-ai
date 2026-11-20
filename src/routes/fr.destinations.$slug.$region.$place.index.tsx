import { SITE_ORIGIN } from "@/config/site";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { destinationPath } from "@/lib/routes/paths";
import { getDestinationGeo } from "@/lib/data/geo.functions";
import { DestinationPageView } from "@/components/destination/DestinationPageView";
import { getDestinationPageData, type DestinationView } from "@/lib/data/destinations.functions";
import { getDestinationLocales, getDestinationTranslation, type DestinationTranslation } from "@/lib/data/translations.functions";
import { getLandingLinksForDestination, type LandingLink } from "@/lib/data/landingPages.functions";
import { frGeoCrumbs, frMeta } from "@/lib/i18n/frSeo";
import { destinationGeo } from "@/lib/routes/paths";
import { regionName } from "@/lib/seo/breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { hreflangLinks } from "@/lib/seo/hreflang";
import { translateDest } from "@/lib/i18n/translateDest";
import { isLocale } from "@/lib/i18n/locales";

export const Route = createFileRoute("/fr/destinations/$slug/$region/$place/")({
  loader: async ({ params }): Promise<{ dest: DestinationView; tr: DestinationTranslation; landingLinks: LandingLink[]; locales: string[] }> => {
    const [tr, dest, geo] = await Promise.all([
      getDestinationTranslation({ data: { slug: params.place, locale: "fr" } }),
      getDestinationPageData({ data: { slug: params.place } }),
      getDestinationGeo({ data: { slug: params.place } }).catch(() => null),
    ]);
    if (!dest || !geo) throw notFound();
    if (!tr) throw redirect({ href: destinationPath(dest.slug), statusCode: 302 });
    if (geo.country !== params.slug || geo.region !== params.region) {
      throw redirect({ href: `/fr/destinations/${geo.country}/${geo.region}/${dest.slug}`, statusCode: 301 });
    }
    const [landingLinks, locales] = await Promise.all([
      getLandingLinksForDestination({ data: { destinationId: dest.id } }).catch(() => []),
      getDestinationLocales({ data: { slug: dest.slug } }).catch(() => ["fr"]),
    ]);
    return { dest: translateDest(dest, tr), tr, landingLinks, locales };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Indisponible — WildParkRoutes" }, { name: "robots", content: "noindex" }] };
    const { tr, dest } = loaderData;
    const url = `${SITE_ORIGIN}${destinationPath(dest.slug, "fr")}`;
    const crumbs = placeCrumbsFr(dest.slug, tr.name);
    return {
      meta: [
        ...frMeta(tr.metaTitle, tr.metaDescription, url),
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(dest.heroImage.startsWith("https://") ? [{ property: "og:image", content: dest.heroImage }, { name: "twitter:image", content: dest.heroImage }] : []),
      ],
      links: [{ rel: "canonical", href: url }, ...hreflangLinks(destinationPath(dest.slug), ["en", ...loaderData.locales.filter(isLocale)])],
      scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", ...breadcrumbJsonLd(crumbs) }).replace(/</g, "\\u003c") }],
    };
  },
  component: Page,
});

function Page() {
  const { dest, tr, landingLinks } = Route.useLoaderData();
  const crumbs = placeCrumbsFr(dest.slug, tr.name);
  return <DestinationPageView dest={dest} landingLinks={landingLinks} crumbs={crumbs} />;
}

function placeCrumbsFr(slug: string, name: string) {
  const g = destinationGeo(slug);
  const parents = g ? frGeoCrumbs(g.country, { slug: g.region, name: regionName(g.region) }) : frGeoCrumbs("us").slice(0, 2);
  return [...parents, { name, path: destinationPath(slug, "fr") }];
}
