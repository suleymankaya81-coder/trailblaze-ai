// Browser-only: imported via React.lazy behind ClientOnly. Uses free
// OpenFreeMap/OpenStreetMap tiles — no API key, no per-request cost.
import { useEffect, useRef, useState } from "react";
import { ExternalLink, LoaderCircle, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n";
import { mapsUrl } from "@/lib/routes/dayRoute";
import { fallbackMapStyle, PRIMARY_MAP_STYLE, PRIMARY_MAP_TIMEOUT, FALLBACK_MAP_TIMEOUT } from "./mapRecovery";
import * as maplibregl from "maplibre-gl";
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import "maplibre-gl/dist/maplibre-gl.css";
import type { TravelMarker } from "@/lib/data/travelPlan";

export default function RoadTripMap({
  route,
  from,
  to,
  stops,
}: {
  route: [number, number][] | null;
  // Primitives, not arrays: array literals get a new identity on every parent
  // render (e.g. when the AI snapshot loads), which would tear down and
  // rebuild the map, discarding the visitor's pan/zoom.
  from: [number, number];
  to: [number, number];
  stops?: TravelMarker[];
}) {
  const fromJson = JSON.stringify(from);
  const toJson = JSON.stringify(to);
  const stopsJson = JSON.stringify(stops ?? []);
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const de = locale === "de";
  const [status, setStatus] = useState<"loading" | "fallback" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  // Only the displayed endpoints; marker array order does not define a driving itinerary.
  const googleUrl = mapsUrl([
    { name: "Start", query: "", lng: from[0], lat: from[1] },
    { name: "End", query: "", lng: to[0], lat: to[1] },
  ]);

  useEffect(() => {
    if (!ref.current) return;
    setStatus("loading");
    const from = JSON.parse(fromJson) as [number, number];
    const to = JSON.parse(toJson) as [number, number];
    const localStops = JSON.parse(stopsJson) as TravelMarker[];
    const bounds = new maplibregl.LngLatBounds(from, from).extend(to);
    localStops.forEach(stop => bounds.extend([stop.lng, stop.lat]));
    const colors = getComputedStyle(document.documentElement);
    // MapLibre's parser needs sRGB; resolve semantic OKLCH tokens through the browser.
    const tokenColor = (token: string) => {
      const canvas = document.createElement("canvas"); canvas.width = 1; canvas.height = 1;
      const context = canvas.getContext("2d");
      if (!context) return colors.getPropertyValue(token).trim();
      context.fillStyle = colors.getPropertyValue(token).trim(); context.fillRect(0, 0, 1, 1);
      const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
      return `rgb(${r}, ${g}, ${b})`;
    };
    const startColor = tokenColor("--sage-deep");
    const endColor = tokenColor("--copper");
    const routeColor = tokenColor("--forest");
    // Vite's dependency bundle cannot resolve the library's relative worker URL.
    maplibregl.setWorkerUrl(mapWorkerUrl);
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
      container: ref.current,
      style: PRIMARY_MAP_STYLE,
      bounds,
      fitBoundsOptions: { padding: 50 },
      attributionControl: { compact: true },
      cooperativeGestures: true,
      ...(locale === "de" ? { locale: {
        "CooperativeGesturesHandler.WindowsHelpText": "Strg + Scrollen zum Zoomen der Karte",
        "CooperativeGesturesHandler.MacHelpText": "⌘ + Scrollen zum Zoomen der Karte",
        "CooperativeGesturesHandler.MobileHelpText": "Mit zwei Fingern die Karte bewegen",
      } } : {}),
      });
    } catch {
      setStatus("error");
      return;
    }
    let disposed = false;
    let fallback = false;
    let failed = false;
    let timer: ReturnType<typeof setTimeout>;
    const recover = () => {
      if (disposed || failed) return;
      clearTimeout(timer);
      if (fallback) {
        failed = true;
        setStatus("error");
        return;
      }
      fallback = true;
      setStatus("fallback");
      timer = setTimeout(recover, FALLBACK_MAP_TIMEOUT);
      map.setStyle(fallbackMapStyle());
    };
    timer = setTimeout(recover, PRIMARY_MAP_TIMEOUT);
    // HTML markers can render before any base tiles have loaded.
    map.on("idle", () => {
      if (disposed || failed || !map.isStyleLoaded() || !map.areTilesLoaded()) return;
      clearTimeout(timer);
      setStatus("ready");
    });
    map.on("error", (event) => {
      const sourceId = "sourceId" in event ? event.sourceId : undefined;
      if (sourceId === "route") return;
      // Ignore late errors from discarded OpenFreeMap requests after switching styles.
      if (!fallback || sourceId === "basemap") recover();
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    new maplibregl.Marker({ color: startColor }).setLngLat(from).addTo(map);
    new maplibregl.Marker({ color: endColor }).setLngLat(to).addTo(map);
    localStops.forEach((stop, i) => {
      const element = document.createElement("button");
      element.className = "map-sight-marker";
      element.textContent = String(i + 1);
      element.setAttribute("aria-label", stop.name);
      const popup = document.createElement("div");
      const label = document.createElement("strong"); label.textContent = stop.name;
      const source = document.createElement("a"); source.href = stop.sourceUrl; source.textContent = locale === "de" ? "Quelle" : "Source"; source.target = "_blank"; source.rel = "noopener noreferrer";
      popup.append(label, document.createElement("br"), source);
      new maplibregl.Marker({ element }).setLngLat([stop.lng, stop.lat]).setPopup(new maplibregl.Popup({ offset: 20 }).setDOMContent(popup)).addTo(map);
    });
    map.on("style.load", () => {
      if (!route || route.length < 2 || map.getSource("route")) return;
      map.addSource("route", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: route } },
      });
      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": routeColor, "line-width": 4 },
      });
    });
    const resize = new ResizeObserver(() => map.resize());
    resize.observe(ref.current);
    return () => {
      disposed = true;
      clearTimeout(timer);
      resize.disconnect();
      map.remove();
    };
  }, [route, fromJson, toJson, stopsJson, attempt, locale]);

  return (
    <div className="relative h-full min-h-[300px] w-full bg-muted" data-map-status={status}>
      <div ref={ref} className="h-full min-h-[300px] w-full" />
      {status !== "ready" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/95 px-5 text-center" role="status" aria-live="polite">
          {status === "error" ? <MapPin className="size-7 text-muted-foreground" /> : <LoaderCircle className="size-6 text-primary motion-safe:animate-spin" />}
          <p className="text-sm text-foreground">
            {status === "error" ? (de ? "Die Karte konnte nicht geladen werden." : "The map could not be loaded.")
              : status === "fallback" ? (de ? "Alternative Karte wird geladen…" : "Loading alternative map…")
              : (de ? "Karte wird geladen…" : "Loading map…")}
          </p>
          {status === "error" && <Button variant="outline" size="sm" onClick={() => setAttempt(value => value + 1)}><RefreshCw />{de ? "Erneut versuchen" : "Try again"}</Button>}
          {googleUrl && <Button asChild size="sm"><a href={googleUrl} target="_blank" rel="noopener noreferrer"><ExternalLink />{de ? "In Google Maps öffnen" : "Open in Google Maps"}</a></Button>}
        </div>
      )}
    </div>
  );
}
