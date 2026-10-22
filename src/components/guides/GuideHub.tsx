import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Search } from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import type { HubEntry, HubFamily } from "@/lib/data/guideHubs.functions";
import { formatDriveShort } from "@/lib/seo/flyDrive";

const PAGE = 48;

export function GuideHub({ family, kicker, title, intro, entries }: { family: HubFamily; kicker: string; title: string; intro: string; entries: HubEntry[] }) {
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [shown, setShown] = useState(PAGE);
  const states = useMemo(() => [...new Set(entries.map((e) => e.state).filter(Boolean))].sort(), [entries]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return entries.filter((e) => (!state || e.state === state) && (!s || e.name.toLowerCase().includes(s) || (e.airportCode ?? "").toLowerCase().includes(s)));
  }, [entries, q, state]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-page py-14 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <Link to="/trip-guides" className="hover:underline">Trip Guides</Link> · {kicker}
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold text-foreground md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">{intro}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE); }} placeholder={family === "fly-and-drive" ? "Search a place or airport code" : "Search a place"} aria-label="Search guides" className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm text-foreground outline-none focus:border-forest" />
          </label>
          <select value={state} onChange={(e) => { setState(e.target.value); setShown(PAGE); }} aria-label="Filter by state" className="h-12 rounded-full border border-border bg-card px-4 text-sm text-foreground">
            <option value="">All states</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{list.length} guides</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, shown).map((e) => (
            <Link key={e.slug} to={`/${family}/$slug` as "/rv-camping/$slug"} params={{ slug: e.slug }} className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
              {e.heroImage && <img src={e.heroImage} alt={e.name} loading="lazy" className="aspect-[16/9] w-full object-cover" />}
              <div className="p-5">
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{e.state}{family === "fly-and-drive" && e.airportCode ? ` · ${e.airportCode}${e.driveMinutes ? ` · ${formatDriveShort(e.driveMinutes)}` : ""}` : ""}</p>
                <h2 className="mt-1 font-display text-lg font-semibold text-foreground">{e.name}</h2>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">Open guide <ArrowUpRight className="h-4 w-4" /></span>
              </div>
            </Link>
          ))}
        </div>
        {shown < list.length && (
          <div className="mt-10 flex justify-center">
            <button type="button" onClick={() => setShown((n) => n + PAGE)} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">Show more</button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
