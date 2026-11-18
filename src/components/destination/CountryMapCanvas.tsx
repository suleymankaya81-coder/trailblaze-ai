import { useEffect, useRef, useState } from "react";
import * as maplibre from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { fallbackMapStyle, PRIMARY_MAP_STYLE } from "./mapRecovery";
import { countryMapLinks, type CountryMapPlace } from "@/lib/routes/countryMap";
import type { Locale } from "@/lib/routes/paths";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function CountryMapCanvas({ places, country, locale }: { places: CountryMapPlace[]; country: string; locale: Locale }) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!container.current || !places.length) return;
    setFailed(false);
    maplibre.setWorkerUrl(workerUrl);
    const bounds = new maplibre.LngLatBounds();
    places.forEach(p => bounds.extend([p.lng, p.lat]));
    let map: maplibre.Map;
    try {
      map = new maplibre.Map({ container: container.current, style: PRIMARY_MAP_STYLE, bounds,
        fitBoundsOptions: { padding: 45, maxZoom: 10 }, cooperativeGestures: true, attributionControl: { compact: true } });
    } catch { setFailed(true); return; }
    let fallback = false;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    const recover = () => {
      if (disposed) return;
      clearTimeout(timer);
      if (fallback) { setFailed(true); return; }
      fallback = true;
      map.setStyle(fallbackMapStyle());
      timer = setTimeout(() => setFailed(true), 12000);
    };
    timer = setTimeout(recover, 5000);
    map.on("error", () => { if (!fallback) recover(); });
    map.on("idle", () => { if (map.isStyleLoaded() && map.areTilesLoaded()) { clearTimeout(timer); setFailed(false); } });
    map.addControl(new maplibre.NavigationControl(), "top-right");
    places.forEach(place => {
      const links = countryMapLinks(country, place, locale);
      const marker = document.createElement("button");
      marker.className = "size-4 min-h-0 rounded-full border-2 border-background bg-primary shadow-sm";
      marker.setAttribute("aria-label", place.name);
      const content = document.createElement("div"); content.className = "flex flex-col gap-2 text-foreground";
      const title = document.createElement("strong"); title.textContent = place.name;
      const link = document.createElement("a"); link.href = links.destination;
      link.textContent = locale === "de" ? "Reiseziel ansehen →" : "View destination →";
      content.append(title, link);
      if (links.maps) {
        const maps = document.createElement("a"); maps.href = links.maps; maps.target = "_blank"; maps.rel = "noopener noreferrer";
        maps.textContent = locale === "de" ? "In Google Maps öffnen" : "Open in Google Maps"; content.append(maps);
      }
      new maplibre.Marker({ element: marker }).setLngLat([place.lng, place.lat])
        .setPopup(new maplibre.Popup({ offset: 12 }).setDOMContent(content)).addTo(map);
    });
    const resize = new ResizeObserver(() => map.resize()); resize.observe(container.current);
    return () => { disposed = true; clearTimeout(timer); resize.disconnect(); map.remove(); };
  }, [places, country, locale, attempt]);
  return <div className="relative h-[420px] w-full bg-muted md:h-[540px]" data-country-map>
    <div ref={container} className="h-full w-full" />
    {failed && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/95" role="status">
      <p>{locale === "de" ? "Karte nicht verfügbar" : "Map unavailable"}</p>
      <Button variant="outline" onClick={() => setAttempt(a => a + 1)}><RefreshCw />{locale === "de" ? "Erneut versuchen" : "Try again"}</Button>
    </div>}
  </div>;
}