import { Clock, Fuel, MapPin, Navigation, ParkingCircle, Sun, Wifi, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TravelPlan } from "@/lib/data/travelPlan";

export function TravelFlow({ name, plan }: { name: string; plan: TravelPlan }) {
  function download() {
    const text = [name, ...plan.days.flatMap((day, i) => [`\nDay ${i + 1}: ${day.title}`, day.start, ...day.stops.map(s => `${s.name}: ${s.detail}`), day.driving, day.note]), "\nLOCAL NOTES", ...plan.intel.map(t => `${t.title}: ${t.text}`), plan.arrival, plan.vehicle, plan.goldenHour, ...plan.sources.map(s => `${s.label}: ${s.url}`)].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-trip.txt`; link.click(); URL.revokeObjectURL(url);
  }
  return <section id="flow" className="scroll-mt-24">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div><p className="mb-2 text-xs font-semibold uppercase text-sage-deep">A little structure. Plenty of freedom.</p><h2 className="text-2xl text-foreground md:text-3xl">{plan.days.length} days in {name}</h2></div>
      <Button variant="outline" onClick={download}><Download /> Save trip</Button>
    </div>
    <ol className="grid gap-4 md:grid-cols-2">
      {plan.days.map((day, i) => <li key={day.title} className="rounded-lg border border-border bg-card p-5 md:p-6">
        <div className="flex items-start gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-primary-foreground text-sm font-bold">{String(i+1).padStart(2,"0")}</span><div><h3 className="text-lg text-foreground">{day.title}</h3><p className="mt-1 flex items-center gap-1.5 text-xs text-sage-deep"><Clock className="h-3.5 w-3.5 shrink-0" />{day.start}</p></div></div>
        <ul className="mt-5 space-y-4">{day.stops.map(stop => <li key={stop.name} className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep" /><div><p className="text-sm font-semibold text-foreground">{stop.name}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{stop.detail}</p></div></li>)}</ul>
        <p className="mt-5 flex gap-2 border-t border-border pt-4 text-xs leading-relaxed text-foreground"><Navigation className="h-4 w-4 shrink-0" />{day.driving}</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{day.note}</p>
      </li>)}
    </ol>
    <div className="mt-6 grid gap-5 border-y border-border py-6 md:grid-cols-3">
      {[{title:"Your first two hours",text:plan.arrival,Icon:Clock},{title:"The right vehicle",text:plan.vehicle,Icon:Navigation},{title:"Chase the light",text:plan.goldenHour,Icon:Sun}].map(({title,text,Icon}) => <div key={title}><Icon className="mb-2 h-5 w-5 text-sage-deep" /><h3 className="text-sm text-foreground">{title}</h3><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p></div>)}
    </div>
  </section>;
}

const intelIcons = { parking: ParkingCircle, signal: Wifi, fuel: Fuel, timing: Sun, access: Navigation };
export function LocalIntel({ plan }: { plan: TravelPlan }) {
  return <div className="mt-6"><h3 className="mb-4 text-lg text-foreground">Know before you go</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{plan.intel.map(tip => {const Icon=intelIcons[tip.kind]; return <div key={tip.kind} className="rounded-lg border border-border bg-card p-5"><Icon className="h-5 w-5 text-sage-deep" /><h4 className="mt-3 text-sm font-semibold text-foreground">{tip.title}</h4><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{tip.text}</p></div>;})}</div><div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground"><span>Check current conditions:</span>{plan.sources.map(s => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4">{s.label}<ExternalLink className="h-3 w-3" /></a>)}</div></div>;
}