import { SITE_ORIGIN } from "@/config/site";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/components/site/LocalLink";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageHero } from "@/components/site/PageHero";
import { PlaceCard } from "@/components/ui-kit";
import { listTranslatedDestinations } from "@/lib/data/translations.functions";
import { t } from "@/lib/i18n";
import { DESTINATIONS_FR, HOME_FR, frMeta } from "@/lib/i18n/frSeo";
import { breadcrumbScript } from "@/lib/seo/breadcrumbs";
import { hreflangLinks } from "@/lib/seo/hreflang";

const title = "Parcs nationaux par pays | WildParkRoutes";
const description = "Découvrez les parcs nationaux et sites nature d'Europe, d'Amérique du Nord, d'Australie et de Nouvelle-Zélande : itinéraires gratuits, cartes et infos pratiques.";
const crumbs = [HOME_FR, DESTINATIONS_FR];

export const Route = createFileRoute("/fr/destinations/")({
  loader: () => listTranslatedDestinations({ data: { locale: "fr" } }),
  head: ({ loaderData }) => ({
    meta: [
      ...frMeta(title, description, `${SITE_ORIGIN}/fr/destinations`),
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(loaderData?.[0]?.heroImage?.startsWith("https://") ? [{ property: "og:image", content: loaderData[0].heroImage }, { name: "twitter:image", content: loaderData[0].heroImage }] : []),
    ],
    links: [{ rel: "canonical", href: `${SITE_ORIGIN}/fr/destinations` }, ...hreflangLinks("/destinations", ["en", "de", "fr"])],
    scripts: [breadcrumbScript(crumbs)],
  }),
  component: Page,
});

function Page() {
  const places = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero crumbs={crumbs} image={places[0]?.heroImage} kicker={t("fr", "dest.kicker")} title={t("fr", "dest.title")} intro={t("fr", "dest.intro")} />
      <main className="container-page py-10 md:py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((p) => (
            <PlaceCard key={p.slug} to="/fr/destinations/$slug" params={{ slug: p.slug }} image={p.heroImage} alt={p.name} title={p.name} summary={p.tagline} info={p.bestSeason} action={t("fr", "dest.seePlan")} />
          ))}
        </div>
        <p className="mt-10 text-sm">
          <Link to="/destinations" hrefLang="en" className="font-semibold text-primary underline">{t("fr", "dest.moreEnglish")}</Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
