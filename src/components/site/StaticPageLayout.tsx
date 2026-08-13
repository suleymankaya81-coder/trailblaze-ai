import type { ReactNode } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export function StaticPageLayout({
  eyebrow,
  title,
  lede,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-beige/30">
      <Header />

      <main className="container-page py-12">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-deep">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">{title}</h1>
          {lede && <p className="mt-4 text-base text-muted-foreground">{lede}</p>}
          {updated && <p className="mt-2 text-xs text-muted-foreground">Last updated {updated}</p>}
        </div>

        <div className="mt-10 max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-soft md:p-10">
          <div className="space-y-8 text-sm leading-relaxed text-foreground/80 [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-foreground [&_h2]:mb-3 [&_p+p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_a]:text-forest [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-forest/80">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
