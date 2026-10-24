import { Thumb } from "@/components/ui-kit";
import planImg from "@/assets/thumbs/plan.jpg";
import { CalendarDays, Clock, Flower2, Leaf, MapPin, Mountain, Plane, Snowflake, Sun, Ticket, Wallet } from "lucide-react";
import type { ReactNode } from "react";

import type { LandingSection } from "@/lib/data/landingTypes";

export type LandingFacts = {
  bestSeason: string | null;
  tripDays: string | null;
  airport: string | null;
  driveMinutes: number | null;
  permitLevel: "high" | "moderate" | "none" | null;
  dailyBudget: number | null;
};

const PERMIT_TEXT = { high: "Reserve ahead", moderate: "Some permits", none: "No permit needed" } as const;

export function factItems(f: LandingFacts) {
  const items: { icon: ReactNode; label: string; value: string }[] = [];
  if (f.bestSeason) items.push({ icon: <CalendarDays className="h-4 w-4" />, label: "Best time", value: f.bestSeason });
  if (f.tripDays) items.push({ icon: <Clock className="h-4 w-4" />, label: "Ideal stay", value: /day/i.test(f.tripDays) ? f.tripDays : `${f.tripDays} days` });
  if (f.airport)
    items.push({
      icon: <Plane className="h-4 w-4" />,
      label: "Fly into",
      value: f.driveMinutes ? `${f.airport} · ${Math.round(f.driveMinutes / 6) / 10}h drive` : f.airport,
    });
  if (f.permitLevel) items.push({ icon: <Ticket className="h-4 w-4" />, label: "Permits", value: PERMIT_TEXT[f.permitLevel] });
  if (f.dailyBudget) items.push({ icon: <Wallet className="h-4 w-4" />, label: "Daily budget", value: `~$${f.dailyBudget}/person (est.)` });
  return items;
}

export function QuickFacts({ facts }: { facts: LandingFacts }) {
  const items = factItems(facts);
  if (!items.length) return null;
  return (
    <div className="container-page relative z-10 mt-4">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-soft sm:grid-cols-3 lg:grid-cols-5">
        {items.map((i) => (
          <div key={i.label} className="bg-card p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-sage-deep">
              {i.icon} {i.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{i.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const SEASONS: { re: RegExp; icon: ReactNode; tone: string; name: string }[] = [
  { re: /spring/i, icon: <Flower2 className="h-5 w-5" />, tone: "bg-sage/25 text-forest", name: "Spring" },
  { re: /summer/i, icon: <Sun className="h-5 w-5" />, tone: "bg-copper/15 text-copper", name: "Summer" },
  { re: /fall|autumn/i, icon: <Leaf className="h-5 w-5" />, tone: "bg-sand/60 text-ink", name: "Fall" },
  { re: /winter/i, icon: <Snowflake className="h-5 w-5" />, tone: "bg-beige text-forest", name: "Winter" },
];

export const seasonOf = (s: LandingSection) => SEASONS.find((x) => x.re.test(s.heading));
export const dayOf = (s: LandingSection) => s.heading.match(/day\s*(\d+)/i)?.[1] ?? null;

function Body({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\n+/).map((p, i) => (
        <p key={i} className="mb-3 leading-relaxed text-muted-foreground last:mb-0">{p}</p>
      ))}
    </>
  );
}

export function SectionBlock({ section, index, cta }: { section: LandingSection; index: number; cta?: ReactNode }) {
  const season = seasonOf(section);
  const day = dayOf(section);

  if (day) {
    return (
      <section className="relative pl-14">
        <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-forest font-display text-lg text-off-white">
          {day}
        </span>
        <span className="absolute left-5 top-10 bottom-[-2.5rem] w-px bg-border" aria-hidden />
        <div className="border-b border-border p-5 md:p-6">
          <h2 className="mb-3 font-display text-2xl text-foreground">{section.heading}</h2>
          <Body text={section.body} />
          {cta && <div className="mt-4 border-t border-border pt-4">{cta}</div>}
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden border-b border-border">
      <div className={`flex items-center gap-3 px-5 py-3 md:px-6 ${season ? season.tone : "bg-beige/60 text-forest"}`}>
        <Thumb src={planImg} size={40} />
        <span className="text-xs font-semibold uppercase tracking-[0.16em]">{season ? season.name : `Step ${index + 1}`}</span>
      </div>
      <div className="p-5 md:p-6">
        <h2 className="mb-3 font-display text-2xl text-foreground">{section.heading}</h2>
        <Body text={section.body} />
        {cta && <div className="mt-4 border-t border-border pt-4">{cta}</div>}
      </div>
    </section>
  );
}

export function SeasonPicker({ sections }: { sections: LandingSection[] }) {
  const found = SEASONS.filter((s) => sections.some((x) => s.re.test(x.heading)));
  if (found.length < 2) return null;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {found.map((s) => (
        <a key={s.name} href={`#season-${s.name.toLowerCase()}`} className={`flex items-center gap-2 min-h-12 rounded-lg px-4 py-3 text-sm font-semibold ${s.tone} hover:opacity-90`}>
          {s.name}
        </a>
      ))}
    </div>
  );
}
