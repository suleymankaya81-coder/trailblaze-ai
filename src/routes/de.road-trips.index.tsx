import { SITE_ORIGIN } from "@/config/site";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageHero } from "@/components/site/PageHero";
import { PlaceCard, SectionHead } from "@/components/ui-kit";
import { getDestinationCovers } from "@/lib/data/destinations.functions";
import { LOOPS } from "@/lib/seo/guides";
import { t } from "@/lib/i18n";
import { HOME_DE, ROAD_TRIPS_DE, deMeta } from "@/lib/i18n/deSeo";
import { breadcrumbScript } from "@/lib/seo/breadcrumbs";
import { hreflangLinks } from "@/lib/seo/hreflang";
import roadImg from "@/assets/thumbs/road.jpg";

const title = "USA-Roadtrips: Rundreisen durch Nationalparks | MiniaLife";
const description = "Rundreisen mit dem Mietwagen oder Wohnmobil durch die Nationalparks der USA – mit Stopps, empfohlenen Tagen und Entfernungen.";
const crumbs = [HOME_DE, ROAD_TRIPS_DE];

export const Route = createFileRoute("/de/road-trips/")({
  loader: () => getDestinationCovers({ data: { slugs: [...new Set(LOOPS.flatMap((l) => l.stops))] } }),
  head: ({ loaderData }) => ({
    meta: [
      ...deMeta(title, description, `${SITE_ORIGIN}/de/road-trips`),
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...((img) => (img?.startsWith("https://") ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []))(Object.values(loaderData ?? {})[0]),
    ],
    links: [{ rel: "canonical", href: `${SITE_ORIGIN}/de/road-trips` }, ...hreflangLinks("/road-trips", ["en", "de"])],
    scripts: [breadcrumbScript(crumbs)],
  }),
  component: Page,
});

function Page() {
  const covers = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero crumbs={crumbs} image={Object.values(covers)[0]} kicker={t("de", "road.kicker")} title={t("de", "road.title")} intro={t("de", "road.intro")} />
      <main className="container-page py-10 md:py-14">
        <SectionHead kicker={t("de", "road.kicker")} title={`${t("de", "road.loopsTitle")} (${LOOPS.length})`} intro={t("de", "road.englishNote")} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LOOPS.map((l) => { const s = l.stops.find((x) => covers[x]); return (
            <PlaceCard key={l.slug} to="/road-trips/$slug" params={{ slug: l.slug }} image={s ? covers[s] : roadImg} alt={l.title} title={l.title} badges={[`${l.stops.length} ${t("de", "road.stops")}`, l.region]} action={t("de", "road.seeLoop")} />
          );})}
        </div>
      </main>
      <Footer />
    </div>
  );
}
