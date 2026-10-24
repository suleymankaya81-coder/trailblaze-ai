import type { ReactNode } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Thumb } from "@/components/ui-kit";
import planImage from "@/assets/thumbs/plan.jpg";

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
    <div className="bg-background">
      <Header />

      <main>
        <div className="border-b border-border bg-card py-12 md:py-16">
        <div className="container-page">
        <div className="max-w-[680px]">
          <Thumb src={planImage} size={64} className="mb-5" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-deep">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-[34px] leading-tight text-foreground md:text-[56px]">{title}</h1>
          {lede && <p className="mt-4 text-base text-muted-foreground">{lede}</p>}
          {updated && <p className="mt-2 text-xs text-muted-foreground">Last updated {updated}</p>}
        </div>
        </div>
        </div>

        <div className="container-page py-12 md:py-16">
          <div className="max-w-[680px] space-y-8 text-base leading-relaxed text-foreground/80 [&_h2]:font-display [&_h2]:text-[26px] [&_h2]:text-foreground [&_h2]:mb-3 [&_p+p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_a]:text-forest [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-forest/80">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
