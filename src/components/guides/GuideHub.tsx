import { T } from "@/lib/i18n";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PlaceCard } from "@/components/ui-kit";
import mapImg from "@/assets/thumbs/map.jpg";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageHero } from "@/components/site/PageHero";
import type { HubEntry, HubFamily } from "@/lib/data/guideHubs.functions";
import { formatDriveShort } from "@/lib/seo/flyDrive";
import { US_REGIONS, type UsRegionKey } from "@/lib/data/usRegions";
import { FilterPanel } from "@/components/site/FilterPanel";
import { Button } from "@/components/ui/button";
import { hubCrumbs } from "@/lib/seo/breadcrumbs";
import { COUNTRY_DIRECTORY, countryFlag, countryLabel } from "@/lib/data/countryDirectory";

const PAGE = 24;
const regionOf = (state: string) => (Object.keys(US_REGIONS) as UsRegionKey[]).find((k) => (US_REGIONS[k].states as readonly string[]).includes(state));

export function GuideHub({ family, kicker, title, intro, entries }: { family: HubFamily; kicker: string; title: string; intro: string; entries: HubEntry[] }) {
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const countries = useMemo(() => COUNTRY_DIRECTORY.map((c) => ({ ...c, n: entries.filter((e) => e.countryCode === c.code).length })).filter((c) => c.n > 0), [entries]);
  const usOnly = country === "us" || (countries.length === 1 && countries[0].code === "us");
  const [region, setRegion] = useState<UsRegionKey | "">("");
  const [shown, setShown] = useState(PAGE);
  const states = useMemo(() => [...new Set(entries.filter((e) => e.countryCode === "us").map((e) => e.state).filter(Boolean))].sort(), [entries]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return entries.filter((e) => (!country || e.countryCode === country) && (!state || e.state === state) && (!region || regionOf(e.state) === region) && (!s || e.name.toLowerCase().includes(s) || (e.airportCode ?? "").toLowerCase().includes(s)));
  }, [entries, q, state, region, country]);
  const heroImage = entries.find((e) => e.heroImage)?.heroImage;
  const reset = () => setShown(PAGE);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero image={heroImage} crumbs={hubCrumbs(title, `/${family}`)} kicker={kicker} title={title} intro={intro}>
        <label className="relative block max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => { setQ(e.target.value); reset(); }} placeholder={family === "fly-and-drive" ? "Search a place or airport code" : "Search a place"} aria-label="Search guides" className="h-14 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm text-foreground shadow-soft outline-none focus:border-forest" />
        </label>
      </PageHero>
      <main className="container-page py-10 md:py-14">
        {countries.length > 1 ? (
          <div className="mb-5 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Country">
            <Button variant={!country ? "default" : "outline"} size="lg" className="shrink-0 rounded-full" type="button" onClick={() => { setCountry(""); setRegion(""); setState(""); reset(); }}><T>All countries</T> <span className="opacity-70">{entries.length}</span></Button>
            {countries.map((c) => (
              <Button key={c.code} variant={country === c.code ? "default" : "outline"} size="lg" className="shrink-0 rounded-full" type="button" onClick={() => { setCountry(c.code); setRegion(""); setState(""); reset(); }}>
                <span aria-hidden="true">{c.flag}</span> {c.name} <span className="opacity-70">{c.n}</span>
              </Button>
            ))}
          </div>
        ) : countries[0] && (
          <p className="mb-5 text-sm text-muted-foreground"><span aria-hidden="true">{countries[0].flag}</span> <T>{`These guides currently cover ${countries[0].name}. Other countries are listed under Destinations.`}</T></p>
        )}
        {usOnly && <FilterPanel><div className="flex flex-wrap items-center gap-2">
          <Button variant={!region ? "default" : "outline"} size="lg" className="rounded-full" type="button" onClick={() => { setRegion(""); reset(); }}>All regions</Button>
          {(Object.keys(US_REGIONS) as UsRegionKey[]).map((k) => (
            <Button key={k} variant={region === k ? "default" : "outline"} size="lg" className="rounded-full" type="button" onClick={() => { setRegion(k); setState(""); reset(); }}>{US_REGIONS[k].label}</Button>
          ))}
          <select value={state} onChange={(e) => { setState(e.target.value); reset(); }} aria-label="Filter by state" className="ml-auto h-12 rounded-full border border-border bg-card px-4 text-sm text-foreground">
            <option value=""><T>All states</T></option>
            {states.filter((s) => !region || regionOf(s) === region).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div></FilterPanel>}
        <p className="mt-5 text-sm text-muted-foreground">{list.length} guides</p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, shown).map((e) => (
            <PlaceCard key={e.slug} to={`/${family}/$slug`} params={{ slug: e.slug }} image={e.heroImage || mapImg} alt={e.name} title={e.name}
              info={`${countryFlag(e.countryCode)} ${[e.state, countryLabel(e.countryCode)].filter(Boolean).join(", ")}`.trim()} badges={[e.airportCode ? `✈ ${e.airportCode}` : "", e.driveMinutes ? `${formatDriveShort(e.driveMinutes)} drive` : ""].filter(Boolean)} action="Open guide" />
          ))}
        </div>
        {shown < list.length && (
          <div className="mt-10 flex justify-center">
            <Button size="lg" type="button" onClick={() => setShown((n) => n + PAGE)}>Show more</Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
