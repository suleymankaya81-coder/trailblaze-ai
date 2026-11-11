import { Download, Map } from "lucide-react";
import { T } from "@/lib/i18n";
import { buildGpx, downloadGpx, mapsUrlParts, slugify, type RoutePoint } from "@/lib/routes/dayRoute";

/** "Open in Google Maps" + "Download GPX" for an ordered list of stops. GPX only when every stop has verified coordinates. */
export function DayRouteActions({ title, points, mapsLabel = "Open day in Google Maps" }: { title: string; points: RoutePoint[]; mapsLabel?: string }) {
  const parts = mapsUrlParts(points);
  if (!parts.length) return null;
  const gpx = buildGpx(title, points);
  const cls = "inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-beige/60";
  return <div className="mt-3 flex flex-wrap gap-2">
    {parts.map((u, i) => <a key={u} href={u} target="_blank" rel="nofollow noopener noreferrer" className={cls}><Map className="h-4 w-4" /><T>{mapsLabel}</T>{parts.length > 1 ? ` (${i + 1}/${parts.length})` : ""}</a>)}
    {gpx && <button type="button" className={cls} onClick={() => downloadGpx(`${slugify(title)}.gpx`, gpx)}><Download className="h-4 w-4" /><T>Download GPX</T></button>}
  </div>;
}
