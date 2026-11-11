import { Download, Map } from "lucide-react";
import { T } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { buildGpx, downloadGpx, mapsUrlParts, slugify, type RoutePoint } from "@/lib/routes/dayRoute";

/** "Open in Google Maps" + "Download GPX" for an ordered list of stops. GPX only when every stop has verified coordinates. */
export function DayRouteActions({ title, points, mapsLabel = "Open day in Google Maps" }: { title: string; points: RoutePoint[]; mapsLabel?: string }) {
  const parts = mapsUrlParts(points);
  if (!parts.length) return null;
  const gpx = buildGpx(title, points);
  return <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={title}>
    {parts.map((u, i) => <Button asChild variant="outline" className="min-h-11 h-auto whitespace-normal py-2 text-xs" key={u}><a href={u} target="_blank" rel="nofollow noopener noreferrer"><Map className="h-4 w-4" /><T>{mapsLabel}</T>{parts.length > 1 ? ` (${i + 1}/${parts.length})` : ""}</a></Button>)}
    {gpx && <Button type="button" variant="outline" className="min-h-11 text-xs" onClick={() => downloadGpx(`${slugify(title)}.gpx`, gpx)}><Download className="h-4 w-4" /><T>Download GPX</T></Button>}
  </div>;
}
