import { SITE_ORIGIN } from "@/config/site";
import { createFileRoute } from "@tanstack/react-router";
import { listTranslatedDestinations } from "@/lib/data/translations.functions";
import { getHomepageDestinations } from "@/lib/data/destinations.functions";
import { frMeta } from "@/lib/i18n/frSeo";
import { hreflangLinks } from "@/lib/seo/hreflang";
import { homeShareMeta } from "@/lib/seo/homeShare";
import { HomePageView } from "./index";

const title = "Road trips & parcs nationaux | WildParkRoutes";
const description = "Itinéraires gratuits de plusieurs jours pour les parcs nationaux d'Europe, d'Amérique du Nord, d'Australie et de Nouvelle-Zélande : cartes, accès et réservations.";

export const Route = createFileRoute("/fr/")({
  loader: async () => {
    const [homeDestinations, translated] = await Promise.all([
      getHomepageDestinations().catch(() => []),
      listTranslatedDestinations({ data: { locale: "fr" } }).catch(() => []),
    ]);
    return { homeDestinations, translatedSlugs: translated.map((p) => p.slug) };
  },
  head: ({ loaderData }) => ({
    meta: [
      ...frMeta(title, description, `${SITE_ORIGIN}/fr`),
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { property: "og:locale:alternate", content: "en_US" },
      ...homeShareMeta(loaderData?.homeDestinations ?? []),
    ],
    links: [{ rel: "canonical", href: `${SITE_ORIGIN}/fr` }, ...hreflangLinks("/", ["en", "de", "fr"])],
  }),
  component: Page,
});

function Page() {
  const { homeDestinations, translatedSlugs } = Route.useLoaderData();
  return <HomePageView homeDestinations={homeDestinations} localSlugs={new Set(translatedSlugs)} />;
}
