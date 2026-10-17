// Browser-only: imported via React.lazy behind ClientOnly. Uses free
// OpenFreeMap/OpenStreetMap tiles — no API key, no per-request cost.
import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
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

  useEffect(() => {
    if (!ref.current) return;
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
    const map = new maplibregl.Map({
      container: ref.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      bounds,
      fitBoundsOptions: { padding: 50 },
      attributionControl: { compact: true },
      cooperativeGestures: true,
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
      const source = document.createElement("a"); source.href = stop.sourceUrl; source.textContent = "Source"; source.target = "_blank"; source.rel = "noopener noreferrer";
      popup.append(label, document.createElement("br"), source);
      new maplibregl.Marker({ element }).setLngLat([stop.lng, stop.lat]).setPopup(new maplibregl.Popup({ offset: 20 }).setDOMContent(popup)).addTo(map);
    });
    map.on("load", () => {
      if (!route) return;
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
    return () => map.remove();
  }, [route, fromJson, toJson, stopsJson]);

  return <div ref={ref} className="h-full min-h-[300px] w-full" />;
}
