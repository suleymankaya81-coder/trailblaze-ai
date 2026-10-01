// Browser-only: imported via React.lazy behind ClientOnly. Uses free
// OpenFreeMap/OpenStreetMap tiles — no API key, no per-request cost.
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function RoadTripMap({
  route,
  from,
  to,
}: {
  route: [number, number][] | null;
  from: [number, number];
  to: [number, number];
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      bounds: new maplibregl.LngLatBounds(from, from).extend(to),
      fitBoundsOptions: { padding: 50 },
      attributionControl: { compact: true },
      cooperativeGestures: true,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    new maplibregl.Marker({ color: "#6b7a5a" }).setLngLat(from).addTo(map);
    new maplibregl.Marker({ color: "#b4693a" }).setLngLat(to).addTo(map);
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
        paint: { "line-color": "#2f4a3a", "line-width": 4 },
      });
    });
    return () => map.remove();
  }, [route, from, to]);

  return <div ref={ref} className="h-full min-h-[300px] w-full" />;
}
