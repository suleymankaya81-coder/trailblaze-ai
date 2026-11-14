import type { StyleSpecification } from "maplibre-gl";

export const PRIMARY_MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
export const PRIMARY_MAP_TIMEOUT = 4000;
export const FALLBACK_MAP_TIMEOUT = 12000;

/** Independent raster tiles: no glyph/sprite dependencies or API key. */
export function fallbackMapStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      basemap: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        maxzoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      },
    },
    layers: [{ id: "basemap", type: "raster", source: "basemap" }],
  };
}