import { lazy, Suspense, useMemo, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/site/LocalLink";
import { countryMapLinks, type CountryMapPlace } from "@/lib/routes/countryMap";
import type { Locale } from "@/lib/routes/paths";
const Canvas = lazy(() => import("./CountryMapCanvas"));

export function CountryExplorationMap({ country, places, locale = "en", regions }: {
  country: string; places: CountryMapPlace[]; locale?: Locale; regions: { slug: string; name: string }[];
}) {
  const de = locale === "de";
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const visible = useMemo(() => places.filter(p => (!region || p.region === region) && p.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())), [places, region, search]);
  if (!places.length) return null;
  return <section id="country-map" className="mb-12 scroll-mt-24">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
      <h2 className="font-display text-2xl">{de ? "Reiseziele auf der Karte" : "Explore destinations on the map"}</h2>
      <span className="text-sm text-muted-foreground">{visible.length} / {places.length} {de ? "Reiseziele" : "destinations"}</span>
    </div>
    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
        <Input className="pl-9" aria-label={de ? "Reiseziele suchen" : "Search map destinations"} placeholder={de ? "Reiseziel suchen" : "Search destinations"} value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" aria-label={de ? "Region filtern" : "Filter map region"} value={region} onChange={e => setRegion(e.target.value)}>
        <option value="">{de ? "Alle Regionen" : "All regions"}</option>
        {regions.map(r => <option key={r.slug} value={r.slug}>{r.name}</option>)}
      </select>
    </div>
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      {visible.length ? <ClientOnly fallback={<div className="h-[420px] bg-muted md:h-[540px]" />}><Suspense fallback={<div className="h-[420px] bg-muted md:h-[540px]" />}><Canvas places={visible} country={country} locale={locale} /></Suspense></ClientOnly>
        : <div className="flex h-[420px] items-center justify-center bg-muted">{de ? "Keine Reiseziele gefunden" : "No destinations found"}</div>}
      <div className="max-h-[300px] overflow-y-auto lg:max-h-[540px]" aria-label={de ? "Kartenreiseziele" : "Map destinations"}>
        {visible.map(p => { const links = countryMapLinks(country, p, locale); return <div key={p.slug} className="flex items-center gap-3 border-b border-border py-3">
          <Link to={links.destination} className="flex-1 text-sm font-medium text-foreground">{p.name}</Link>
          {links.maps && <Button asChild variant="ghost" size="icon" title={de ? `${p.name} in Google Maps` : `${p.name} in Google Maps`}><a href={links.maps} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} — Google Maps`}><MapPin /></a></Button>}
        </div>; })}
      </div>
    </div>
  </section>;
}