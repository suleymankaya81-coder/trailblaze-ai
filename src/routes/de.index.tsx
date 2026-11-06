import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageHero } from "@/components/site/PageHero";
import { PlaceCard, SectionHead } from "@/components/ui-kit";
import { listTranslatedDestinations } from "@/lib/data/translations.functions";
import { t } from "@/lib/i18n";
import { deMeta } from "@/lib/i18n/deSeo";
import { hreflangLinks } from "@/lib/seo/hreflang";

const title = "USA-Roadtrip planen: Nationalpark-Reisepläne | MiniaLife";
const description = "Fertige Reisepläne für Yellowstone, Grand Canyon, Zion & mehr: Tag-für-Tag-Routen, Reservierungshinweise und Tipps für Ihren USA-Roadtrip.";

export const Route = createFileRoute("/de/")({
  loader: () => listTranslatedDestinations({ data: { locale: "de" } }),
  head: ({ loaderData }) => ({
    meta: [
      ...deMeta(title, description, "https://minialife.com/de"),
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(loaderData?.[0]?.heroImage?.startsWith("https://") ? [{ property: "og:image", content: loaderData[0].heroImage }, { name: "twitter:image", content: loaderData[0].heroImage }] : []),
    ],
    links: [{ rel: "canonical", href: "https://minialife.com/de" }, ...hreflangLinks("/", ["en", "de"])],
  }),
  component: Page,
});

function Page() {
  const places = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero image={places[0]?.heroImage} kicker={t("de", "home.kicker")} title={t("de", "home.title")} intro={t("de", "home.intro")}>
        <div className="flex flex-wrap gap-2">
          <Link to="/de/destinations" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">{t("de", "home.ctaDestinations")}</Link>
          <Link to="/de/road-trips" className="rounded-full bg-card px-5 py-2.5 text-sm font-semibold text-foreground">{t("de", "home.ctaRoadTrips")}</Link>
        </div>
      </PageHero>
      <main className="container-page py-10 md:py-14">
        <SectionHead kicker={t("de", "dest.kicker")} title={t("de", "home.featured")} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((p) => (
            <PlaceCard key={p.slug} to="/de/destinations/$slug" params={{ slug: p.slug }} image={p.heroImage} alt={p.name} title={p.name} summary={p.tagline} info={p.bestSeason} action={t("de", "dest.seePlan")} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
