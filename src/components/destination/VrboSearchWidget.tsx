import { ArrowUpRight, Home, Mountain, Trees } from "lucide-react";
import { buildVrboSearchUrl } from "@/lib/affiliates/vrbo";

const POINTS = [
  { icon: Mountain, title: "Cabins & mountain lodges", text: "Whole-home stays close to the park." },
  { icon: Trees, title: "Room for the whole crew", text: "Kitchens, fire pits and space to spread out." },
  { icon: Home, title: "Live prices & dates", text: "Pick your dates on Vrbo to see what's open." },
];

/** Vrbo cabins card — links to a tracked Vrbo search for this destination. */
export function VrboSearchWidget({ destinationName }: { destinationName: string }) {
  const href = buildVrboSearchUrl(destinationName);
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Vrbo</p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">
            Cabins & vacation homes near {destinationName}
          </h3>
        </div>
        <a
          href={href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          See stays on Vrbo <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {POINTS.map(({ icon: Icon, title, text }) => (
          <li key={title}>
            <a
              href={href}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="flex h-full gap-3 rounded-xl border border-border bg-background p-4 hover:border-primary"
            >
              <Icon className="h-5 w-5 shrink-0 text-primary" />
              <span>
                <span className="block text-sm font-semibold text-foreground">{title}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{text}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[11px] text-muted-foreground">
        Opens Vrbo's own search. Minialife may earn a commission on bookings, at no extra cost to you.
      </p>
    </div>
  );
}
