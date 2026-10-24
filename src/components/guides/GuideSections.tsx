import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

import type { Faq } from "@/lib/seo/flyDrive";
import { PlaceCard, Thumb } from "@/components/ui-kit";
import planImg from "@/assets/thumbs/plan.jpg";

export function GuideHero({ image, kicker, title, crumbs, children }: { image: string; kicker: string; title: string; crumbs: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden">
      {image && <img src={image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/20" />
      <div className="container-page py-12 md:py-20">
        <nav className="mb-6 text-xs text-off-white/80">{crumbs}</nav>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-off-white/80">{kicker}</p>
        <h1 className="mt-3 max-w-3xl font-display text-[34px] font-semibold leading-tight text-off-white md:text-[56px]">{title}</h1>
        {children && <div className="mt-8 flex flex-wrap gap-2">{children}</div>}
      </div>
    </section>
  );
}

export function HeroChip({ icon, image, children }: { icon?: ReactNode; image?: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-off-white/25 bg-off-white/15 px-4 py-2 text-sm font-medium text-off-white backdrop-blur">
      {image && <Thumb src={image} size={32} />}
      {children}
    </span>
  );
}

export function GuideSection({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <section className="container-page py-10 md:py-14">
      <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{title}</h2>
      {intro && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{intro}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function ReservationPanel({ headline, note, sourceUrl }: { headline: string | null; note: string; sourceUrl: string | null }) {
  return (
    <div className="border-l-2 border-primary bg-sand/40 p-6 md:p-8">
      <div className="flex items-center gap-3">
        <Thumb src={planImg} size={48} />
        <p className="font-display text-xl font-semibold text-foreground">{headline ?? "Reservations"}</p>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-foreground/85">{note}</p>
      {sourceUrl && (
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-4">
          Official source <ArrowUpRight className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

export function GuideFaq({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {faqs.map((f) => (
        <details key={f.q} className="group py-4">
          <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-4 font-semibold text-foreground">{f.q}<span aria-hidden className="text-xl text-primary group-open:rotate-45">+</span></summary>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function FullGuideLink({ slug, name, label }: { slug: string; name: string; label?: string }) {
  return (
    <Link to="/destinations/$slug" params={{ slug }} className="flex min-h-12 items-center justify-between gap-4 border-y border-border bg-forest p-6 text-off-white md:p-8">
      <span>
        <span className="block text-xs uppercase tracking-wider text-off-white/70">Full guide</span>
        <span className="font-display text-xl font-semibold">{label ?? `Stays, day-by-day plan and route map for ${name}`}</span>
      </span>
      <ArrowUpRight className="h-6 w-6 shrink-0" />
    </Link>
  );
}

export function DestTile({ slug, name, image, meta }: { slug: string; name: string; image: string; meta?: string }) {
  return <PlaceCard to="/destinations/$slug" params={{ slug }} image={image} alt={name} title={name} info={meta} />;
}
