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
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { COUNTRY_DIRECTORY, CONTINENTS, countryLabel } from "@/lib/data/countryDirectory";
import { countryPath } from "@/lib/routes/paths";
import { selectTranslatedPlaces } from "@/lib/i18n/directory";

const title = "Parcs nationaux par pays | WildParkRoutes";
const description = "Découvrez les parcs nationaux et sites nature d'Europe, d'Amérique du Nord, d'Australie et de Nouvelle-Zélande : itinéraires gratuits, cartes et infos pratiques.";
const crumbs = [HOME_FR, DESTINATIONS_FR];

export const Route = createFileRoute("/fr/destinations/")({
  validateSearch: search => z.object({ country: z.string().regex(/^[a-z]{2}$/).optional(), q: z.string().optional(), page: z.coerce.number().int().min(1).optional() }).parse(search),
  loaderDeps: ({ search }) => ({ country: search.country ?? "", q: search.q ?? "", page: search.page ?? 1 }),
  loader: async ({ deps }) => ({ ...selectTranslatedPlaces(await listTranslatedDestinations({ data: { locale: "fr" } }), deps.country, deps.q, deps.page), country: deps.country, q: deps.q }),
  head: ({ loaderData }) => ({
    meta: [
      ...frMeta(title, description, `${SITE_ORIGIN}/fr/destinations`),
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(loaderData?.places[0]?.heroImage?.startsWith("https://") ? [{ property: "og:image", content: loaderData.places[0].heroImage }, { name: "twitter:image", content: loaderData.places[0].heroImage }] : []),
      ...(loaderData && (loaderData.country || loaderData.q || loaderData.page > 1) ? [{ name: "robots", content: "noindex, follow" }] : []),
    ],
    links: [{ rel: "canonical", href: `${SITE_ORIGIN}/fr/destinations` }, ...hreflangLinks("/destinations", ["en", "de", "fr"])],
    scripts: [breadcrumbScript(crumbs)],
  }),
  component: Page,
});

function Page() {
  const { places, counts, total, country, q, page, pages } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero crumbs={crumbs} image={places[0]?.heroImage} kicker={t("fr", "dest.kicker")} title={t("fr", "dest.title")} intro={t("fr", "dest.intro")} />
      <main className="container-page py-10 md:py-14">
        <section aria-labelledby="fr-by-country" className="mb-10">
          <h2 id="fr-by-country" className="text-xl md:text-2xl">Explorer par pays</h2>
          {CONTINENTS.map(continent => {
            const countries = COUNTRY_DIRECTORY.filter(c => c.continent === continent.key && counts[c.code]);
            if (!countries.length) return null;
            return <div key={continent.key} className="mt-5">
              <p className="text-sm font-semibold text-muted-foreground">{continent.key === "europe" ? "Europe" : continent.key === "north-america" ? "Amérique du Nord" : "Océanie"}</p>
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {countries.map(c => <li key={c.code}><Link to={countryPath(c.code, "fr")} className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-primary">
                  <span aria-hidden="true" className="text-2xl">{c.flag}</span><span><span className="block text-sm font-semibold">{countryLabel(c.code, "fr")}</span><span className="text-xs text-muted-foreground">{counts[c.code]} destinations</span></span>
                </Link></li>)}
              </ul>
            </div>;
          })}
        </section>
        <form method="get" action="/fr/destinations" className="mb-8 grid gap-3 sm:grid-cols-[auto_1fr_auto]">
          <select name="country" defaultValue={country} aria-label="Pays" className="h-12 rounded-lg border border-border bg-card px-3 text-sm">
            <option value="">Tous les pays</option>
            {COUNTRY_DIRECTORY.filter(c => counts[c.code]).map(c => <option key={c.code} value={c.code}>{countryLabel(c.code, "fr")}</option>)}
          </select>
          <input name="q" defaultValue={q} aria-label="Rechercher une destination" placeholder="Rechercher une destination" className="h-12 rounded-lg border border-border bg-card px-3 text-sm" />
          <Button type="submit" size="lg">Rechercher</Button>
        </form>
        <p className="mb-4 text-sm text-muted-foreground">{total} destinations</p>
        {!places.length && <p>Aucune destination trouvée.</p>}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((p) => (
            <PlaceCard key={p.slug} to="/fr/destinations/$slug" params={{ slug: p.slug }} image={p.heroImage} alt={p.name} title={p.name} summary={p.tagline} info={p.bestSeason} action={t("fr", "dest.seePlan")} />
          ))}
        </div>
        {pages > 1 && <nav aria-label="Pages des destinations" className="mt-10 flex items-center justify-center gap-4 text-sm">
          {page > 1 && <Link to="/fr/destinations" search={{ country, q, page: page - 1 }} className="font-semibold text-primary underline">Précédent</Link>}
          <span>Page {page} sur {pages}</span>
          {page < pages && <Link to="/fr/destinations" search={{ country, q, page: page + 1 }} className="font-semibold text-primary underline">Suivant</Link>}
        </nav>}
      </main>
      <Footer />
    </div>
  );
}
