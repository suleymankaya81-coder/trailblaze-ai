import { T, useLocale } from "@/lib/i18n";
import { useState } from "react";
import { Link } from "@/components/site/LocalLink";
import { SectionHead, SectionLink } from "@/components/ui-kit";
import { CONTINENTS, COUNTRY_DIRECTORY, countryLabel, type Continent } from "@/lib/data/countryDirectory";
import { countryPath } from "@/lib/routes/paths";

/** "Explore by country" band: continent tabs and photo cards for each published country. */
export function HomeCountries({ covers }: { covers: Record<string, string> }) {
  const locale = useLocale() === "de" ? "de" : "en";
  const continents = CONTINENTS.filter((c) => COUNTRY_DIRECTORY.some((d) => d.continent === c.key));
  const [tab, setTab] = useState<Continent>(continents[0]?.key ?? "europe");
  const [showAll, setShowAll] = useState(false);
  const all = COUNTRY_DIRECTORY.filter((c) => c.continent === tab);
  const list = showAll ? all : all.slice(0, 8);

  return (
    <section id="countries" className="section-y border-b border-border bg-card">
      <div className="container-page">
        <SectionHead kicker="Explore by country" title="Pick a country, then a region" action={<SectionLink to="/destinations"><T>All destinations</T></SectionLink>} />
        <div role="tablist" aria-label="Continents" className="-mt-2 mb-6 flex gap-2">
          {continents.map((c) => (
            <button key={c.key} role="tab" type="button" aria-selected={tab === c.key} onClick={() => { setTab(c.key); setShowAll(false); }}
              className={"min-h-11 rounded-full px-5 text-sm font-semibold transition " + (tab === c.key ? "bg-primary text-primary-foreground" : "border border-border bg-background text-foreground hover:border-primary")}>
              <T>{c.label}</T> <span className="opacity-70">{COUNTRY_DIRECTORY.filter((d) => d.continent === c.key).length}</span>
            </button>
          ))}
        </div>
        <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 md:grid-cols-3 lg:grid-cols-4">
          {list.map((c) => (
            <li key={c.code} className="w-[68%] shrink-0 snap-start sm:w-auto">
              <Link to={countryPath(c.code, locale)} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                {covers[c.code] && <img src={covers[c.code]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-4 text-off-white">
                  <span className="text-2xl" aria-hidden="true">{c.flag}</span>
                  <span className="mt-1 block font-display text-xl leading-tight md:text-2xl">{countryLabel(c.code, locale)}</span>
                  <span className="mt-1 block text-xs opacity-90">{c.places} <T>places</T> · {c.regions} <T>regions</T></span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {all.length > 8 && (
          <div className="mt-6 flex justify-center">
            <button type="button" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}
              className="min-h-11 rounded-full border border-border bg-background px-6 text-sm font-semibold text-foreground transition hover:border-primary">
              {showAll ? <T>Show fewer countries</T> : <><T>Show all countries</T> (+{all.length - 8})</>}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
