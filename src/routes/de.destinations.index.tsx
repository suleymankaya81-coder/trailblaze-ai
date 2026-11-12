import { SITE_ORIGIN } from "@/config/site";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/components/site/LocalLink";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageHero } from "@/components/site/PageHero";
import { PlaceCard } from "@/components/ui-kit";
import { listTranslatedDestinations } from "@/lib/data/translations.functions";
import { t } from "@/lib/i18n";
import { DESTINATIONS_DE, HOME_DE, deMeta } from "@/lib/i18n/deSeo";
import { breadcrumbScript } from "@/lib/seo/breadcrumbs";
import { hreflangLinks } from "@/lib/seo/hreflang";

const title = "Nationalparks USA: Reisepläne auf Deutsch | WildParkRoutes";
const description = "Reisepläne für die beliebtesten Nationalparks der USA: Tagesrouten, beste Reisezeit, Reservierungen und Tipps vor Ort – auf Deutsch.";
const crumbs = [HOME_DE, DESTINATIONS_DE];

export const Route = createFileRoute("/de/destinations/")({
  loader: () => listTranslatedDestinations({ data: { locale: "de" } }),
  head: ({ loaderData }) => ({
    meta: [
      ...deMeta(title, description, `${SITE_ORIGIN}/de/destinations`),
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(loaderData?.[0]?.heroImage?.startsWith("https://") ? [{ property: "og:image", content: loaderData[0].heroImage }, { name: "twitter:image", content: loaderData[0].heroImage }] : []),
    ],
    links: [{ rel: "canonical", href: `${SITE_ORIGIN}/de/destinations` }, ...hreflangLinks("/destinations", ["en", "de"])],
    scripts: [breadcrumbScript(crumbs)],
  }),
  component: Page,
});

function Page() {
  const places = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero crumbs={crumbs} image={places[0]?.heroImage} kicker={t("de", "dest.kicker")} title={t("de", "dest.title")} intro={t("de", "dest.intro")} />
      <main className="container-page py-10 md:py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((p) => (
            <PlaceCard key={p.slug} to="/de/destinations/$slug" params={{ slug: p.slug }} image={p.heroImage} alt={p.name} title={p.name} summary={p.tagline} info={p.bestSeason} action={t("de", "dest.seePlan")} />
          ))}
        </div>
        <p className="mt-10 text-sm">
          <Link to="/destinations" hrefLang="en" className="font-semibold text-primary underline">{t("de", "dest.moreEnglish")}</Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
