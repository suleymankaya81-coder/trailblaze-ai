import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Copy, RotateCcw, Trash2, Caravan, Tent, Ticket, Car } from "lucide-react";
import { T, useTp } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/site/LocalLink";
import { DayRouteActions } from "@/components/ui-kit/DayRouteActions";
import type { TravelPlan } from "@/lib/data/travelPlan";
import { haversineMiles } from "@/lib/routes/dayRoute";
import { campLinks, decodeLayout, defaultLayout, encodeLayout, stopPool, MAX_DAYS, MIN_DAYS, type Layout } from "@/lib/routes/tripBuilder";
import { motorhomeRepublicLink, airportRentalsLink } from "@/lib/affiliates/webjet";
import { HARVEST_HOSTS_URL } from "@/components/destination/HarvestHostsCard";

const storeKey = (slug: string) => `trip-builder:${slug}`;

export function TripBuilder({ slug, name, region, plan }: { slug: string; name: string; region?: string; plan: TravelPlan }) {
  const tp = useTp();
  const pool = useMemo(() => stopPool(plan, name, region), [plan, name, region]);
  const initial = useMemo(() => defaultLayout(plan, pool), [plan, pool]);
  const [layout, setLayout] = useState<Layout>(initial);
  const [copied, setCopied] = useState(false);

  // Read shared link / saved edits only after hydration.
  useEffect(() => {
    const fromUrl = decodeLayout(new URLSearchParams(window.location.search).get("r"), pool.length);
    const saved = fromUrl ?? decodeLayout(localStorage.getItem(storeKey(slug)), pool.length);
    if (saved) setLayout(saved);
  }, [slug, pool.length]);
  useEffect(() => {
    const enc = encodeLayout(layout);
    localStorage.setItem(storeKey(slug), enc);
    const url = new URL(window.location.href); url.searchParams.set("r", enc);
    window.history.replaceState(window.history.state, "", url);
  }, [layout, slug]);

  const used = new Set(layout.flat());
  const unused = pool.map((_, i) => i).filter(i => !used.has(i));
  const update = (fn: (l: Layout) => void) => setLayout(prev => { const next = prev.map(d => [...d]); fn(next); return next; });
  const move = (d: number, i: number, dir: -1 | 1) => update(l => {
    const j = i + dir;
    if (j >= 0 && j < l[d].length) { [l[d][i], l[d][j]] = [l[d][j], l[d][i]]; return; }
    const nd = d + dir; if (nd < 0 || nd >= l.length) return;
    const [s] = l[d].splice(i, 1); dir < 0 ? l[nd].push(s) : l[nd].unshift(s);
  });

  async function share() {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
  }

  const cls = "inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-beige/60 disabled:opacity-40";
  return <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground"><T>Trip length</T>:</span>
        {Array.from({ length: MAX_DAYS - MIN_DAYS + 1 }, (_, k) => MIN_DAYS + k).map(n =>
          <Button key={n} size="sm" variant={layout.length === n ? "default" : "outline"} onClick={() => update(l => { while (l.length < n) l.push([]); while (l.length > n) { const last = l.pop()!; l[l.length - 1].push(...last); } })}>{n} <T>days</T></Button>)}
        <Button size="sm" variant="ghost" onClick={() => setLayout(initial)}><RotateCcw /> <T>Reset</T></Button>
        <Button size="sm" variant="outline" onClick={share}><Copy /> {copied ? <T>Link copied</T> : <T>Copy share link</T>}</Button>
      </div>
      <ol className="space-y-4">
        {layout.map((day, d) => {
          const pts = day.map(i => pool[i]);
          const miles = pts.slice(1).reduce<number | null>((m, p, k) => { const x = haversineMiles(pts[k], p); return m == null || x == null ? null : m + x; }, 0);
          const night = pts[pts.length - 1];
          const camp = night ? campLinks(night, slug) : null;
          return <li key={d} className="rounded-lg border border-border bg-card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-lg text-foreground"><T>Day</T> {d + 1}</h2>{miles != null && pts.length > 1 && <span className="text-xs text-muted-foreground">≈ {Math.round(miles)} mi <T>straight-line, approx.</T></span>}</div>
            {day.length === 0 && <p className="mt-3 text-sm text-muted-foreground"><T>No stops yet — add one below or keep it as a free day.</T></p>}
            <ul className="mt-3 space-y-2">{day.map((idx, i) => <li key={idx} className="flex items-center gap-2 rounded-md bg-beige/40 p-2">
              <span className="flex-1 text-sm font-medium text-foreground"><T>{pool[idx].name}</T></span>
              <button type="button" className={cls} aria-label={tp("Move up")} disabled={d === 0 && i === 0} onClick={() => move(d, i, -1)}><ArrowUp className="h-4 w-4" /></button>
              <button type="button" className={cls} aria-label={tp("Move down")} disabled={d === layout.length - 1 && i === day.length - 1} onClick={() => move(d, i, 1)}><ArrowDown className="h-4 w-4" /></button>
              <button type="button" className={cls} aria-label={tp("Remove stop")} onClick={() => update(l => { l[d].splice(i, 1); })}><Trash2 className="h-4 w-4" /></button>
            </li>)}</ul>
            {unused.length > 0 && <select aria-label={tp("Add a stop")} className="mt-3 h-11 w-full rounded-md border border-border bg-background px-3 text-sm" value="" onChange={e => { const v = Number(e.target.value); if (e.target.value !== "") update(l => { l[d].push(v); }); }}>
              <option value="">{tp("+ Add a stop")}</option>{unused.map(i => <option key={i} value={i}>{pool[i].name}</option>)}
            </select>}
            <DayRouteActions title={`${name} day ${d + 1}`} points={pts} />
            {camp && <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs"><span className="text-muted-foreground"><T>Stay near</T> <T>{night.name}</T>:</span>
              <a href={camp.campspot} target="_blank" rel="sponsored nofollow noopener" className="font-semibold text-primary underline underline-offset-4">Campspot</a>
              <a href={camp.roverpass} target="_blank" rel="sponsored nofollow noopener" className="font-semibold text-primary underline underline-offset-4">RoverPass</a>
              <a href={HARVEST_HOSTS_URL} target="_blank" rel="sponsored nofollow noopener" className="font-semibold text-primary underline underline-offset-4">Harvest Hosts</a></div>}
          </li>;
        })}
      </ol>
      <div className="mt-6"><DayRouteActions title={`${name} trip`} points={layout.flat().map(i => pool[i])} mapsLabel="Open whole trip in Google Maps" /></div>
    </div>
    <aside className="h-fit space-y-3 rounded-lg border border-border bg-card p-5">
      <h2 className="text-lg text-foreground"><T>Book your trip</T></h2>
      <a href={motorhomeRepublicLink()} target="_blank" rel="sponsored nofollow noopener" className="flex min-h-11 items-center gap-2 rounded-md border border-border p-3 text-sm font-semibold hover:bg-beige/60"><Caravan className="h-4 w-4" /><T>Compare RVs</T> · Motorhome Republic</a>
      <a href={airportRentalsLink()} target="_blank" rel="sponsored nofollow noopener" className="flex min-h-11 items-center gap-2 rounded-md border border-border p-3 text-sm font-semibold hover:bg-beige/60"><Car className="h-4 w-4" /><T>Compare cars & SUVs</T> · Airport Rentals</a>
      <Link to="/destinations/$slug" params={{ slug }} hash="trip-tours" className="flex min-h-11 items-center gap-2 rounded-md border border-border p-3 text-sm font-semibold hover:bg-beige/60"><Ticket className="h-4 w-4" /><T>Tours in</T> <T>{name}</T></Link>
      <Link to="/destinations/$slug" params={{ slug }} hash="stays" className="flex min-h-11 items-center gap-2 rounded-md border border-border p-3 text-sm font-semibold hover:bg-beige/60"><Tent className="h-4 w-4" /><T>All stays near</T> <T>{name}</T></Link>
      <p className="text-xs text-muted-foreground"><T>Your edits stay in this browser. No account needed.</T></p>
    </aside>
  </div>;
}
