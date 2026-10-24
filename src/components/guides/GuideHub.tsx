import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
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

const PAGE = 24;
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
          <Button variant={!region ? "default" : "outline"} size="lg" className="rounded-full" type="button" onClick={() => { setRegion(""); reset(); }}>All regions</Button>
          {(Object.keys(US_REGIONS) as UsRegionKey[]).map((k) => (
            <Button key={k} variant={region === k ? "default" : "outline"} size="lg" className="rounded-full" type="button" onClick={() => { setRegion(k); setState(""); reset(); }}>{US_REGIONS[k].label}</Button>
          ))}
          <select value={state} onChange={(e) => { setState(e.target.value); reset(); }} aria-label="Filter by state" className="ml-auto h-12 rounded-full border border-border bg-card px-4 text-sm text-foreground">
            <option value="">All states</option>
            {states.filter((s) => !region || regionOf(s) === region).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div></FilterPanel>
        <p className="mt-5 text-sm text-muted-foreground">{list.length} guides</p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, shown).map((e) => (
            <PlaceCard key={e.slug} to={`/${family}/$slug`} params={{ slug: e.slug }} image={e.heroImage || mapImg} alt={e.name} title={e.name}
              badges={[e.state, e.airportCode ? `✈ ${e.airportCode}` : "", e.driveMinutes ? `${formatDriveShort(e.driveMinutes)} drive` : ""].filter(Boolean)} action="Open guide" />
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
