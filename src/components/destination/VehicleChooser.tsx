import { trackEvent } from "@/lib/analytics";

export type VehiclePick = "car" | "suv" | "rv";
export const VEHICLE_PILOT_SLUGS = ["grand-canyon"];

const OPTIONS: { id: VehiclePick; title: string; hint: string }[] = [
  { id: "car", title: "Car", hint: "Solo or couple, staying in hotels" },
  { id: "suv", title: "SUV", hint: "Family, luggage or dirt roads" },
  { id: "rv", title: "Motorhome / campervan", hint: "Sleep inside the park" },
];

export function VehicleChooser({ slug, value, onChange }: { slug: string; value: VehiclePick | null; onChange: (v: VehiclePick) => void }) {
  return (
    <div className="mb-5 rounded-xl border border-border bg-card p-4">
      <p className="font-display text-base text-foreground">Which vehicle fits your trip?</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {OPTIONS.map((o) => (
          <button key={o.id} type="button" aria-pressed={value === o.id}
            onClick={() => { onChange(o.id); trackEvent("vehicle_choice", { choice: o.id, destination_slug: slug }); }}
            className={`rounded-lg border p-3 text-left transition-colors ${value === o.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
            <span className="block text-sm font-semibold text-foreground">{o.title}</span>
            <span className="block text-xs text-muted-foreground">{o.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
