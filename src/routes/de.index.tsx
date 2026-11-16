import { SITE_ORIGIN } from "@/config/site";
import { createFileRoute } from "@tanstack/react-router";
import { listTranslatedDestinations } from "@/lib/data/translations.functions";
import { getHomepageDestinations } from "@/lib/data/destinations.functions";
import { deMeta } from "@/lib/i18n/deSeo";
import { hreflangLinks } from "@/lib/seo/hreflang";
import { HomePageView } from "./index";

const title = "Nationalparks & Roadtrips weltweit planen | WildParkRoutes";
const description = "Fertige Reisepläne für Nationalparks in USA, Kanada, Deutschland, Österreich, Schweiz, Italien, Spanien & UK: Tag-für-Tag-Routen und Karten.";

export const Route = createFileRoute("/de/")({
  loader: async () => {
    const [homeDestinations, translated] = await Promise.all([
      getHomepageDestinations().catch(() => []),
      listTranslatedDestinations({ data: { locale: "de" } }).catch(() => []),
    ]);
    return { homeDestinations, translatedSlugs: translated.map((p) => p.slug) };
  },
  head: () => ({
    meta: [
      ...deMeta(title, description, `${SITE_ORIGIN}/de`),
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_ORIGIN}/de` }, ...hreflangLinks("/", ["en", "de"])],
  }),
  component: Page,
});

function Page() {
  const { homeDestinations, translatedSlugs } = Route.useLoaderData();
  return <HomePageView homeDestinations={homeDestinations} localSlugs={new Set(translatedSlugs)} />;
}
