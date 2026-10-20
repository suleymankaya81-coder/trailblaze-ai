import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BadgeDollarSign,
  Bike,
  Layers,
  Map,
  Mountain,
  MousePointerClick,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { catalogPrice, CATALOG_REVIEW_DATE, gearShopLink } from "@/lib/data/rockbrosGear";
import { activityLabel, activityTone, shopPicks, type GearActivity } from "@/lib/data/gearShop";
import hero from "@/assets/gear/shop-hero.jpg";
import actBike from "@/assets/gear/act-bikepacking.jpg";
import actCycling from "@/assets/gear/act-cycling.jpg";
import actRepair from "@/assets/gear/act-repair.jpg";
import actRoad from "@/assets/gear/act-roadtrip.jpg";
import why from "@/assets/gear/why-rockbros.jpg";
import guideBike from "@/assets/gear/bikepacking-hero.jpg";

const activities: Array<{ key: GearActivity; img: string; text: string; icon: typeof Bike; iconTone: string }> = [
  { key: "bikepacking", img: actBike, text: "Go further, carry more.", icon: Mountain, iconTone: "text-sage" },
  { key: "cycling", img: actCycling, text: "Comfort, safety, performance.", icon: Bike, iconTone: "text-sky-soft" },
  { key: "repair", img: actRepair, text: "Be ready for the unexpected.", icon: Wrench, iconTone: "text-clay-soft" },
  { key: "roadtrip", img: actRoad, text: "Gear for the long haul.", icon: Map, iconTone: "text-amber" },
];

const reviewed = new Date(CATALOG_REVIEW_DATE).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function SectionHead({ eyebrow, title, sub, link }: { eyebrow: string; title: string; sub?: string; link?: { label: string; href: string } }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">{eyebrow}</p>
        <h2 className="mt-2 text-2xl text-forest md:text-3xl">{title}</h2>
        {sub && <p className="mt-2 text-muted-foreground">{sub}</p>}
      </div>
      {link && (
        <a href={link.href} className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-forest hover:underline sm:inline-flex">
          {link.label} <ArrowRight className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

export function GearShopPage() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <img src={hero} alt="Cyclist with a loaded bikepacking bike above a canyon river at sunset" width={1920} height={800} className="absolute inset-0 -z-10 h-full w-full object-cover object-right" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/55 to-transparent" />
          <div className="container-page relative py-16 text-off-white md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-off-white/85">Outdoor Gear &amp; Accessories</p>
            <h1 className="mt-3 text-5xl text-off-white md:text-6xl">Gear Shop</h1>
            <p className="mt-4 text-xl font-medium">The right gear makes every adventure better.</p>
            <p className="mt-3 max-w-xl text-off-white/85">
              From bikepacking essentials to everyday cycling gear, explore our handpicked recommendations from trusted brands like ROCKBROS. Get ready for your next journey.
            </p>
            <ul className="mt-8 flex flex-wrap gap-y-4 text-sm">
              {[
                { icon: ShieldCheck, a: "Quality Gear", b: "Trusted Brands" },
                { icon: Mountain, a: "Adventure Ready", b: "For Every Terrain" },
                { icon: MousePointerClick, a: "Fast & Easy", b: "Shop Direct Links" },
              ].map(({ icon: Icon, a, b }, i) => (
                <li key={a} className={`flex w-full items-center gap-3 pr-6 sm:w-auto ${i ? "sm:border-l sm:border-off-white/30 sm:pl-6" : ""}`}>
                  <Icon className="h-7 w-7 shrink-0 text-amber" />
                  <span className="leading-tight"><strong className="block font-semibold">{a}</strong><span className="text-off-white/80">{b}</span></span>
                </li>
              ))}
            </ul>
            <p className="pointer-events-none absolute bottom-16 right-10 hidden -rotate-12 font-hand text-4xl leading-tight text-off-white lg:block">
              Better Gear,<br />Bigger Adventures
            </p>
          </div>
        </section>

        {/* Activities */}
        <section id="categories" className="container-page py-14">
          <SectionHead eyebrow="Shop by activity" title="Find the Gear for Your Next Adventure" sub="Browse our curated gear collections, designed for every type of outdoor explorer." link={{ label: "View All Gear Categories", href: "#picks" }} />
          <div className="mt-8 gear-carousel md:!grid md:!grid-flow-row md:grid-cols-2 lg:grid-cols-4">
            {activities.map(({ key, img, text, icon: Icon, iconTone }) => (
              <a key={key} href="#picks" className="group relative block aspect-[6/5] overflow-hidden rounded-xl shadow-soft">
                <img src={img} alt={`${activityLabel[key]} illustration`} loading="lazy" width={912} height={736} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest via-forest/85 to-transparent p-4 pt-14 text-off-white">
                  <p className="flex items-center gap-2 font-semibold"><Icon className={`h-5 w-5 ${iconTone}`} />{activityLabel[key]}</p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-sm text-off-white/85">
                    <span>{text}</span>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-off-white/20"><ArrowRight className="h-4 w-4" /></span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Activity photos are illustrative.</p>
        </section>

        {/* Picks */}
        <section id="picks" className="bg-beige/60 py-14">
          <div className="container-page">
            <SectionHead eyebrow="Featured products" title="Popular Gear Picks" link={{ label: "View All Products", href: "/gear/7-bikepacking-essentials" }} />
            <div className="mt-8 gear-carousel md:!grid md:!grid-flow-row md:grid-cols-3 xl:grid-cols-6">
              {shopPicks.map(({ product, activity }) => (
                <article key={product.id} className="flex flex-col rounded-xl border border-border bg-card p-3 shadow-soft">
                  <span className={`self-start rounded px-2 py-0.5 text-[10px] font-semibold ${activityTone[activity]}`}>{activityLabel[activity]}</span>
                  <img src={product.image} alt={product.catalogTitle} loading="lazy" width={300} height={300} className="mx-auto my-3 aspect-square w-full max-w-44 object-contain md:max-w-none" />
                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">ROCKBROS {product.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{product.purpose}</p>
                  <p className="mt-2 text-lg font-bold text-foreground">{catalogPrice(product)}</p>
                  <p className="text-[10px] text-muted-foreground">Catalog price, checked {reviewed}</p>
                  <a href={gearShopLink(product)} target="_blank" rel="sponsored nofollow noopener" className="mt-3 inline-flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                    View on ROCKBROS <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Why ROCKBROS */}
        <section className="container-page grid gap-5 py-14 lg:grid-cols-[5fr_7fr]">
          <div className="relative min-h-64 overflow-hidden rounded-xl">
            <img src={why} alt="Mountain biker riding a ridge trail at sunset" loading="lazy" width={1024} height={640} className="absolute inset-0 h-full w-full object-cover" />
            <p className="absolute bottom-8 left-6 -rotate-12 font-hand text-3xl leading-tight text-off-white">Right Gear,<br />Better Rides</p>
          </div>
          <div className="rounded-xl bg-sand-warm p-6 md:p-8">
            <h2 className="text-2xl text-forest">Why Choose ROCKBROS?</h2>
            <p className="mt-3 max-w-xl text-sm text-foreground/80">
              ROCKBROS offers affordable gear designed for real adventures. From bikepacking bags to cycling accessories, their range helps you go further, ride safer and enjoy the journey.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-5 text-sm md:grid-cols-4">
              {[
                { icon: Wrench, t: "Durable & Reliable", c: "text-forest" },
                { icon: BadgeDollarSign, t: "Great Value", c: "text-clay" },
                { icon: Layers, t: "Wide Range", c: "text-forest" },
                { icon: Award, t: "Popular with Cyclists", c: "text-clay" },
              ].map(({ icon: Icon, t, c }) => (
                <li key={t} className="flex items-center gap-2"><Icon className={`h-7 w-7 shrink-0 ${c}`} /><span className="leading-tight">{t}</span></li>
              ))}
            </ul>
            <Link to="/gear/7-bikepacking-essentials" className="mt-7 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Explore ROCKBROS Gear <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Guides */}
        <section className="bg-forest py-14 text-off-white">
          <div className="container-page">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-off-white/80">Gear guides</p>
            <h2 className="mt-2 text-2xl text-off-white md:text-3xl">Expert Guides &amp; Buying Advice</h2>
            <p className="mt-2 max-w-md text-sm text-off-white/80">Not sure what you need? Check out our detailed guides to help you find the right gear for your next adventure.</p>
            <div className="mt-8 gear-carousel md:!grid md:!grid-flow-row md:grid-cols-2 lg:grid-cols-4">
              {[
                { img: guideBike, badge: "Buying Guide", tone: "bg-amber text-ink", t: "7 Bikepacking Essentials", s: "Everything you need for your first trip.", to: "/gear/7-bikepacking-essentials" },
                { img: actCycling, badge: "Buying Guide", tone: "bg-amber text-ink", t: "Best Cycling Accessories", s: "Seven small upgrades for safer rides.", to: "/gear/best-cycling-accessories" },
                { img: actRepair, badge: "Buying Guide", tone: "bg-amber text-ink", t: "Bike Repair Kit Essentials", s: "Be ready for the unexpected.", to: "/gear/bike-repair-kit-essentials" },
                { img: actRoad, badge: "Travel Guide", tone: "bg-sky text-primary-foreground", t: "US Road Trip Loops", s: "Multi-park routes for every skill level.", to: "/road-trips" },
              ].map((g) => {
                const body = (
                  <>
                    <div className="relative">
                      <img src={g.img} alt="" loading="lazy" width={912} height={736} className="h-28 w-full object-cover" />
                      <span className={`absolute -bottom-2 left-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${g.tone}`}>{g.badge}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-4 pt-5">
                      <div className="min-w-0"><h3 className="text-sm font-semibold text-foreground">{g.t}</h3><p className="mt-1 text-xs text-muted-foreground">{g.s}</p></div>
                      {g.to && <ArrowRight className="h-4 w-4 shrink-0 text-forest" />}
                    </div>
                  </>
                );
                return g.to ? (
                  <Link key={g.t} to={g.to} className="block overflow-hidden rounded-xl bg-card hover:shadow-lift">{body}</Link>
                ) : (
                  <div key={g.t} className="overflow-hidden rounded-xl bg-card opacity-90">{body}</div>
                );
              })}
            </div>
          </div>
        </section>

        <p className="container-page py-6 text-xs text-muted-foreground">
          Product links are affiliate links: MiniaLife may earn a commission at no extra cost to you. Prices come from the ROCKBROS catalog and may change. See our <Link to="/affiliate-disclosure" className="underline">affiliate disclosure</Link>.
        </p>
      </main>
      <Footer />
    </div>
  );
}
