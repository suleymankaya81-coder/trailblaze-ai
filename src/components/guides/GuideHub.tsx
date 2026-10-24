import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock, MapPin, Plane, Search } from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageHero } from "@/components/site/PageHero";
import type { HubEntry, HubFamily } from "@/lib/data/guideHubs.functions";
import { formatDriveShort } from "@/lib/seo/flyDrive";
import { US_REGIONS, type UsRegionKey } from "@/lib/data/usRegions";
import { FilterPanel } from "@/components/site/FilterPanel";
import { Button } from "@/components/ui/button";

const PAGE = 48;
const regionOf = (state: string) => (Object.keys(US_REGIONS) as UsRegionKey[]).find((k) => (US_REGIONS[k].states as readonly string[]).includes(state));

export function GuideHub({ family, kicker, title, intro, entries }: { family: HubFamily; kicker: string; title: string; intro: string; entries: HubEntry[] }) {
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [region, setRegion] = useState<UsRegionKey | "">("");
  const [shown, setShown] = useState(PAGE);
  const states = useMemo(() => [...new Set(entries.map((e) => e.state).filter(Boolean))].sort(), [entries]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return entries.filter((e) => (!state || e.state === state) && (!region || regionOf(e.state) === region) && (!s || e.name.toLowerCase().includes(s) || (e.airportCode ?? "").toLowerCase().includes(s)));
  }, [entries, q, state, region]);
  const heroImage = entries.find((e) => e.heroImage)?.heroImage;
  const reset = () => setShown(PAGE);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero image={heroImage} kicker={<><Link to="/trip-guides" className="hover:underline">Trip Guides</Link> · {kicker}</>} title={title} intro={intro}>
        <label className="relative block max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => { setQ(e.target.value); reset(); }} placeholder={family === "fly-and-drive" ? "Search a place or airport code" : "Search a place"} aria-label="Search guides" className="h-14 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm text-foreground shadow-soft outline-none focus:border-forest" />
        </label>
      </PageHero>
      <main className="container-page py-10 md:py-14">
        <FilterPanel><div className="flex flex-wrap items-center gap-2">
          <Button variant={!region ? "default" : "outline"} size="lg" type="button" onClick={() => { setRegion(""); reset(); }}>All regions</Button>
          {(Object.keys(US_REGIONS) as UsRegionKey[]).map((k) => (
            <Button key={k} variant={region === k ? "default" : "outline"} size="lg" type="button" onClick={() => { setRegion(k); setState(""); reset(); }}>{US_REGIONS[k].label}</Button>
          ))}
          <select value={state} onChange={(e) => { setState(e.target.value); reset(); }} aria-label="Filter by state" className="ml-auto h-10 rounded-full border border-border bg-card px-4 text-sm text-foreground">
            <option value="">All states</option>
            {states.filter((s) => !region || regionOf(s) === region).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div></FilterPanel>
        <p className="mt-5 text-sm text-muted-foreground">{list.length} guides</p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, shown).map((e) => (
            <Link key={e.slug} to={`/${family}/$slug` as "/rv-camping/$slug"} params={{ slug: e.slug }} className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-soft transition hover:shadow-lg">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {e.heroImage && <img src={e.heroImage} alt={e.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold text-foreground"><MapPin className="h-3 w-3" />{e.state}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-display text-lg font-semibold text-foreground">{e.name}</h2>
                {(e.airportCode || e.driveMinutes) && (
                  <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold">
                    {e.airportCode && <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-primary-foreground"><Plane className="h-3 w-3" />{e.airportCode}</span>}
                    {e.driveMinutes ? <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-foreground"><Clock className="h-3 w-3" />{formatDriveShort(e.driveMinutes)} drive</span> : null}
                  </div>
                )}
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary">Open guide <ArrowUpRight className="h-4 w-4" /></span>
              </div>
            </Link>
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
