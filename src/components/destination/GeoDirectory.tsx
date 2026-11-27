import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageHero } from "@/components/site/PageHero";
import { PlaceCard } from "@/components/ui-kit";
import type { Crumb } from "@/lib/seo/breadcrumbs";
import { T } from "@/lib/i18n";
import type { ReactNode } from "react";

export type DirectoryItem = { to: string; title: string; image: string; summary?: string | null; info?: string | null };

/** Shared country and region directory: hero with breadcrumb trail and a grid of place cards. */
export function GeoDirectory({ kicker, title, intro, crumbs, heading, items, action, image, children, lead = [], facts = [], factsHeading = "At a glance" }: {
  kicker: string; title: string; intro: string; crumbs: Crumb[]; heading: string; items: DirectoryItem[]; action: string; image?: string; children?: ReactNode;
  /** Answer-first sentences from stored facts (hubSummary.hubLead); already in the page language. */
  lead?: string[];
  facts?: { label: string; value: string }[];
  factsHeading?: string;
}) {
  return (
    <div className="bg-background">
      <Header />
      <PageHero kicker={<T>{kicker}</T>} title={title} intro={intro} crumbs={crumbs} image={image} />
      <main className="container-page py-10">
        {lead.length > 0 && <p id="answer" className="mb-8 max-w-3xl text-lg leading-relaxed text-foreground">{lead.join(" ")}</p>}
        {facts.length > 0 && (
          <section aria-labelledby="glance-title" className="mb-10">
            <h2 id="glance-title" className="mb-4 font-display text-2xl text-foreground"><T>{factsHeading}</T></h2>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {facts.map((f) => <div key={f.label} className="rounded-lg border border-border bg-card p-4"><dt className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}</dt><dd className="mt-1 text-sm font-semibold text-foreground">{f.value}</dd></div>)}
            </dl>
          </section>
        )}
        {children}
        <h2 className="mb-5 font-display text-2xl text-foreground"><T>{heading}</T></h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <PlaceCard key={it.to} to={it.to} image={it.image} alt={it.title} title={it.title} summary={it.summary} info={it.info} action={action} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
