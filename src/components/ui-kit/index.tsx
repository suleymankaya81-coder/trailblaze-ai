import { useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Section heading: small kicker, serif title, optional right-side link. */
export function SectionHead({ kicker, title, intro, action }: { kicker: string; title: string; intro?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-deep">{kicker}</p>
        <h2 className="mt-2 text-[26px] leading-tight text-foreground md:text-4xl">{title}</h2>
        {intro && <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="inline-flex min-h-12 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
      {children} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

/** Small photo used in place of an icon. */
export function Thumb({ src, alt = "", size = 72, className }: { src: string; alt?: string; size?: number; className?: string }) {
  return <img src={src} alt={alt} width={size} height={size} loading="lazy" style={{ width: size, height: size }} className={cn("shrink-0 rounded-[10px] object-cover", className)} />;
}

export function Pill({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "mustard" | "warn" | "dark" }) {
  const tones = {
    light: "bg-card/95 text-foreground",
    mustard: "bg-mustard text-ink",
    warn: "bg-card text-terracotta",
    dark: "bg-ink/70 text-off-white",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold", tones[tone])}>{children}</span>;
}

/** Template 1 — category square (REI "Shop top categories"). */
export function CategoryTile({ to, image, label, detail }: { to: string; image: string; label: string; detail?: string }) {
  return (
    <Link to={to} className="group flex min-h-12 flex-col items-center text-center">
      <span className="block aspect-square w-full overflow-hidden rounded-[10px] bg-thumb p-2">
        <img src={image} alt="" loading="lazy" className="h-full w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-105" />
      </span>
      <span className="mt-3 text-sm font-semibold text-foreground group-hover:underline">{label}</span>
      {detail && <span className="mt-0.5 text-xs text-muted-foreground">{detail}</span>}
    </Link>
  );
}

/** Template 2 — place / route card: 4:3 photo, ≤3 badges, serif title, summary, info + action. */
export function PlaceCard({ to, params, image, alt, badges = [], title, summary, info, action = "See the plan", large = false }: {
  to: string; params?: Record<string, string>; image: string; alt: string; badges?: string[]; title: string; summary?: string | null; info?: string | null; action?: string; large?: boolean;
}) {
  return (
    <Link to={to} params={params as never} className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-soft">
      <div className={cn("relative overflow-hidden", large ? "aspect-[4/3] md:aspect-[16/11]" : "aspect-[4/3]")}>
        <img src={image} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        {badges.length > 0 && <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">{badges.slice(0, 3).map((b) => <Pill key={b}>{b}</Pill>)}</div>}
      </div>
      <div className="flex flex-1 flex-col p-4 md:p-5">
        <h3 className={cn("leading-snug text-foreground", large ? "text-2xl" : "text-lg md:text-xl")}>{title}</h3>
        {summary && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{summary}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-xs text-muted-foreground">{info}</span>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">{action} <ArrowRight className="h-4 w-4" /></span>
        </div>
      </div>
    </Link>
  );
}

/** Template 5 — editorial green card (REI "Expert advice"). */
export function EditorialCard({ to, image, title, summary, action }: { to: string; image: string; title: string; summary: string; action: string }) {
  return (
    <Link to={to} className="group flex h-full flex-col overflow-hidden rounded-xl bg-forest text-off-white">
      <div className="aspect-video overflow-hidden"><img src={image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /></div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl leading-snug">{title}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-off-white/80">{summary}</p>
        <span className="mt-5 inline-flex min-h-12 items-center justify-center gap-1.5 rounded-md bg-card px-4 text-sm font-semibold text-forest">{action} <ArrowRight className="h-4 w-4" /></span>
      </div>
    </Link>
  );
}

/** Template 6 — split band: text + action one side, visual the other; stacks on phones. */
export function SplitBand({ image, imageAlt = "", children, reverse = false }: { image?: string; imageAlt?: string; children: ReactNode; reverse?: boolean }) {
  return (
    <div className={cn("grid overflow-hidden rounded-xl border border-border bg-card md:grid-cols-2", reverse && "md:[&>*:first-child]:order-2")}>
      {image && <img src={image} alt={imageAlt} loading="lazy" className="aspect-[16/10] h-full w-full object-cover md:aspect-auto" />}
      <div className="p-6 md:p-10">{children}</div>
    </div>
  );
}

/** Phone swipe row (85% cards, next card peeks) with a thin progress line; grid on larger screens. */
export function SwipeRow({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  return (
    <div>
      <div ref={ref} onScroll={() => { const r = ref.current; if (r) setProgress(r.scrollLeft / Math.max(1, r.scrollWidth - r.clientWidth)); }} className={cn("swipe-row", className)}>{children}</div>
      <div className="mt-4 h-0.5 overflow-hidden rounded-full bg-border md:hidden" aria-hidden>
        <div className="h-full w-1/4 rounded-full bg-forest transition-transform" style={{ transform: `translateX(${progress * 300}%)` }} />
      </div>
    </div>
  );
}
