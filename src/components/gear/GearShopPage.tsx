import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronRight, Handshake, Sparkles } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { gearCategories, GEAR_COUNTS_REVIEW_DATE, wildguarderProducts, wildguarderPrice, wildguarderStoreUrl, wildguarderLink, WILDGUARDER_REVIEW_DATE } from "@/lib/data/gearCategories";
import hero from "@/assets/gear/cats-hero.jpg";
import catCamping from "@/assets/gear/cat-camping.jpg";
import catHiking from "@/assets/gear/cat-hiking.jpg";
import catOptics from "@/assets/gear/cat-optics.jpg";
import catCycling from "@/assets/gear/cat-cycling.jpg";
import catLights from "@/assets/gear/cat-lights.jpg";
import catApparel from "@/assets/gear/cat-apparel.jpg";
import catEyewear from "@/assets/gear/cat-eyewear.jpg";
import catBags from "@/assets/gear/cat-bags.jpg";
import spotlightNight from "@/assets/gear/spotlight-night.jpg";
import tripCamping from "@/assets/gear/trip-camping.jpg";
import tripRoad from "@/assets/gear/trip-road.jpg";
import tripNight from "@/assets/gear/trip-night.jpg";
import brandWildguarder from "@/assets/gear/brand-wildguarder.jpg";
import actCycling from "@/assets/gear/act-cycling.jpg";
import actRepair from "@/assets/gear/act-repair.jpg";
import guideBike from "@/assets/gear/bikepacking-hero.jpg";

const categoryImages: Record<string, string> = {
  camping: catCamping,
  hiking: catHiking,
  optics: catOptics,
  cycling: catCycling,
  lights: catLights,
  apparel: catApparel,
  eyewear: catEyewear,
  bags: catBags,
};

const chips = ["All", "Camping", "Hiking", "Optics & Night Vision", "Cycling", "Lights & Power", "Apparel & Cold Weather", "Travel Bags"];

const countsReviewed = new Date(GEAR_COUNTS_REVIEW_DATE).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const wgReviewed = new Date(WILDGUARDER_REVIEW_DATE).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const tripTypes = [
  { img: tripCamping, title: "Camping Weekend", items: ["Tent & sleep system", "Camp kitchen gear", "Lighting & power"], href: "#categories" },
  { img: tripRoad, title: "National Park Road Trip", items: ["Daypacks & hiking gear", "Travel bags & organizers", "Cameras & optics"], href: "#categories" },
  { img: tripNight, title: "Night Wildlife Watching", items: ["Night vision binoculars", "Warm layers", "Field guides & accessories"], href: "#night-vision" },
];

const destinationCards = [
  {
    name: "Moab, Utah",
    text: "Desert trails, epic rides and starry skies.",
    img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Delicate_arch_sunset.jpg/1920px-Delicate_arch_sunset.jpg",
    credit: "Palacemusic / CC BY-SA 3.0 via Wikimedia Commons",
    to: "/destinations/moab",
  },
  {
    name: "Yellowstone",
    text: "Wildlife, geothermal wonders and endless trails.",
    img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0b/Aerial_image_of_Grand_Prismatic_Spring_%28view_from_the_south%29.jpg/1920px-Aerial_image_of_Grand_Prismatic_Spring_%28view_from_the_south%29.jpg",
    credit: "Carsten Steger / CC BY-SA 4.0 via Wikimedia Commons",
    to: "/destinations/yellowstone",
  },
  {
    name: "Lake Tahoe",
    text: "Alpine adventures year round.",
    img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e8/Emerald_Bay%2C_Lake_Tahoe%2C_California._2015.jpg/1920px-Emerald_Bay%2C_Lake_Tahoe%2C_California._2015.jpg",
    credit: "Eric Philbin / CC0 via Wikimedia Commons",
    to: "/destinations/lake-tahoe",
  },
];

const guides = [
  { img: guideBike, t: "7 Bikepacking Essentials", s: "Must-have gear for your next adventure.", to: "/gear/7-bikepacking-essentials" },
  { img: actCycling, t: "Best Cycling Accessories", s: "Upgrade your ride, go further.", to: "/gear/best-cycling-accessories" },
  { img: actRepair, t: "Bike Repair Kit Essentials", s: "Be prepared on any trail.", to: "/gear/bike-repair-kit-essentials" },
  { img: spotlightNight, t: "Night Vision Binoculars Guide", s: "Coming soon", to: undefined as string | undefined },
];

function SectionHead({ title, link }: { title: string; link?: { label: string; href: string } }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-2xl text-forest md:text-3xl">{title}</h2>
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
          <img src={hero} alt="Campsite with a glowing tent and an SUV carrying bikes by an alpine lake at sunset" width={1920} height={1024} className="absolute inset-0 -z-10 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-ink/45" />
          <div className="container-page flex min-h-[26rem] flex-col items-center justify-center py-16 text-center text-off-white">
            <p className="text-xs font-medium text-off-white/85">Gear Shop <span className="mx-1">/</span> All Categories</p>
            <h1 className="mt-3 text-4xl text-off-white md:text-5xl">All Gear Categories</h1>
            <p className="mt-3 max-w-xl text-off-white/90">Outdoor gear for every trip — from camp to trail to night sky.</p>
            <nav aria-label="Gear category shortcuts" className="mt-8 flex max-w-3xl flex-wrap justify-center gap-2">
              {chips.map((chip) => (
                <a
                  key={chip}
                  href="#categories"
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    chip === "All" ? "bg-forest text-primary-foreground" : "bg-off-white text-ink hover:bg-sand"
                  }`}
                >
                  {chip}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {/* Shop by Category */}
        <section id="categories" className="container-page scroll-mt-24 py-14">
          <SectionHead title="Shop by Category" link={{ label: "View all gear", href: "#categories" }} />
          <div className="mt-8 gear-carousel md:!grid md:!grid-flow-row md:grid-cols-2 lg:grid-cols-4">
            {gearCategories.map(({ key, label, items, icon: Icon, tone, href }) => {
              const body = (
                <>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={categoryImages[key]} alt={`${label} illustration`} loading="lazy" width={1024} height={768} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className={`absolute -bottom-4 left-4 grid h-9 w-9 place-items-center rounded-full ${tone}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                  </div>
                  <div className="p-4 pt-6">
                    <h3 className="text-sm font-semibold text-foreground">{label}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{items.toLocaleString("en-US")} items</p>
                    <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-forest">
                      {href ? (<>Explore <ArrowRight className="h-3 w-3" /></>) : "Coming soon"}
                    </p>
                  </div>
                </>
              );
              return href ? (
                href.startsWith("#") ? (
                  <a key={key} href={href} className="group block overflow-hidden rounded-xl border border-border bg-card shadow-soft hover:shadow-lift">{body}</a>
                ) : (
                  <a key={key} href={href} className="group block overflow-hidden rounded-xl border border-border bg-card shadow-soft hover:shadow-lift">{body}</a>
                )
              ) : (
                <div key={key} className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">{body}</div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Item counts from the ROCKBROS catalog, checked {countsReviewed}; Optics &amp; Night Vision lists our WILDGUARDER partner models. Category photos are illustrative.
          </p>
        </section>

        {/* Featured Brands */}
        <section className="container-page py-6">
          <SectionHead title="Featured Brands" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <a href="/gear/7-bikepacking-essentials" className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-soft hover:shadow-lift">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-extrabold tracking-tight text-foreground">ROCKBROS</p>
                <p className="mt-1 text-xs text-muted-foreground">Cycling, camping &amp; outdoor accessories</p>
                <p className="mt-1 text-xs text-muted-foreground">2,010 catalog products</p>
              </div>
              <img src={actCycling} alt="Cyclist riding a mountain road at sunset" loading="lazy" width={1024} height={768} className="h-20 w-28 shrink-0 rounded-lg object-cover" />
            </a>
            <a href="#night-vision" className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-soft hover:shadow-lift">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-extrabold tracking-tight text-foreground">WILDGUARDER</p>
                <p className="mt-1 text-xs text-muted-foreground">Night vision binoculars &amp; optics</p>
                <p className="mt-1 text-xs text-muted-foreground">3 featured models</p>
              </div>
              <img src={brandWildguarder} alt="Great horned owl perched on a pine branch at night" loading="lazy" width={1024} height={768} className="h-20 w-28 shrink-0 rounded-lg object-cover" />
            </a>
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card p-4 text-center shadow-soft">
              <Handshake className="h-7 w-7 text-sage-deep" />
              <p className="text-sm font-semibold text-foreground">More partner brands</p>
              <p className="text-xs text-muted-foreground">coming soon</p>
            </div>
          </div>
        </section>

        {/* Spotlight: Night Vision */}
        <section id="night-vision" className="container-page scroll-mt-24 py-10">
          <div className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-soft lg:grid-cols-2">
            <div className="relative min-h-72">
              <img src={spotlightNight} alt="Person looking through night vision binoculars under the Milky Way" loading="lazy" width={1024} height={1024} className="absolute inset-0 h-full w-full object-cover" />
              <p className="absolute bottom-6 left-6 font-hand text-3xl leading-tight text-off-white">Explore a wilder,<br />darker world.</p>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">Spotlight: See the Night</p>
              <h2 className="mt-2 text-2xl text-forest md:text-3xl">Night Vision for Wildlife &amp; Stargazing</h2>
              <p className="mt-2 text-sm text-muted-foreground">Get closer to nature after dark with WILDGUARDER night vision optics.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {wildguarderProducts.map((p) => (
                  <a key={p.id} href={wildguarderLink(p.url, `gear-wildguarder-${p.id}`)} target="_blank" rel="sponsored nofollow noopener" className="rounded-xl border border-border bg-background p-3 hover:shadow-lift">
                    <img src={p.image} alt={`WILDGUARDER ${p.name}`} loading="lazy" width={300} height={300} className="aspect-square w-full rounded-lg bg-off-white object-contain" />
                    <h3 className="mt-2 line-clamp-2 text-xs font-semibold text-foreground">WILDGUARDER {p.name}</h3>
                    <p className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">{p.spec}</p>
                    <p className="mt-1.5 text-sm font-bold text-foreground">{wildguarderPrice(p)}</p>
                    <p className="text-[10px] text-muted-foreground">Official store price, checked {wgReviewed}</p>
                  </a>
                ))}
              </div>
              <a href={wildguarderLink(wildguarderStoreUrl, "gear-wildguarder-store")} target="_blank" rel="sponsored nofollow noopener" className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Shop WILDGUARDER <ArrowRight className="h-4 w-4" />
              </a>
              <p className="mt-3 text-[10px] text-muted-foreground">Links go to the official WILDGUARDER store.</p>
            </div>
          </div>
        </section>

        {/* Trip types + destinations */}
        <section className="container-page grid gap-10 py-10 lg:grid-cols-2">
          <div>
            <SectionHead title="Gear by Trip Type" link={{ label: "View all trip types", href: "#categories" }} />
            <div className="mt-6 space-y-4">
              {tripTypes.map((t) => (
                <div key={t.title} className="flex gap-4 rounded-xl border border-border bg-card p-3 shadow-soft">
                  <img src={t.img} alt={`${t.title} illustration`} loading="lazy" width={1024} height={768} className="h-28 w-32 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{t.title}</h3>
                    <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                      {t.items.map((item) => (
                        <li key={item} className="flex items-center gap-1.5"><Check className="h-3 w-3 shrink-0 text-forest" />{item}</li>
                      ))}
                    </ul>
                    <a href={t.href} className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-forest hover:underline">
                      See matching gear <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionHead title="Gear for your next destination" link={{ label: "View all destinations", href: "/destinations" }} />
            <div className="mt-6 space-y-4">
              {destinationCards.map((d) => (
                <Link key={d.name} to={d.to} className="group flex gap-4 rounded-xl border border-border bg-card p-3 shadow-soft hover:shadow-lift">
                  <img src={d.img} alt={`${d.name} scenery`} loading="lazy" width={1920} height={1280} className="h-28 w-32 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{d.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{d.text}</p>
                    <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-forest group-hover:underline">
                      See the trip plan <ArrowRight className="h-3 w-3" />
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground/80">Photo: {d.credit}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Buying Guides */}
        <section className="bg-forest py-14 text-off-white">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl text-off-white md:text-3xl">Buying Guides</h2>
              <span className="hidden items-center gap-1 text-xs font-semibold text-off-white/80 sm:inline-flex">
                View all guides <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-8 gear-carousel md:!grid md:!grid-flow-row md:grid-cols-2 lg:grid-cols-4">
              {guides.map((g) => {
                const body = (
                  <>
                    <div className="relative">
                      <img src={g.img} alt="" loading="lazy" width={1024} height={768} className="h-32 w-full object-cover" />
                      {!g.to && <span className="absolute -bottom-2 left-3 rounded-full bg-amber px-2 py-0.5 text-[10px] font-bold uppercase text-ink">Coming soon</span>}
                    </div>
                    <div className="flex items-center justify-between gap-2 p-4">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-foreground">{g.t}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{g.s}</p>
                      </div>
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border ${g.to ? "border-forest text-forest" : "border-border text-muted-foreground"}`}>
                        <ArrowRight className="h-4 w-4" />
                      </span>
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
          Partner links via Awin. We may earn a commission at no extra cost to you. Prices come from the partner catalogs and may change. Some photos are illustrative. See our <Link to="/affiliate-disclosure" className="underline">affiliate disclosure</Link>.
        </p>
      </main>
      <Footer />
    </div>
  );
}
