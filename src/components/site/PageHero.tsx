import type { ReactNode } from "react";
import { SafeImage } from "@/components/shared/SafeImage";

/** Photo-backed hero band shared by directory pages (road trips, gateways, guide hubs). */
export function PageHero({ image, kicker, title, intro, children }: { image?: string; kicker: ReactNode; title: string; intro: string; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-forest">
      {image ? <SafeImage src={image} alt="" aria-hidden className="absolute inset-0 -z-10 h-full w-full object-cover" /> : null}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-foreground/85 via-foreground/60 to-foreground/20" />
      <div className="container-page py-16 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background/80">{kicker}</p>
        <h1 className="mt-3 max-w-3xl font-display text-[34px] leading-tight text-background md:text-[56px]">{title}</h1>
        <p className="mt-4 max-w-2xl text-base text-background/85 md:text-lg">{intro}</p>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
