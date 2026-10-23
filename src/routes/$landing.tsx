import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";

import { Footer } from "@/components/site/Footer";
import { ViatorPlaceBlock } from "@/components/destination/ViatorPlaceBlock";
import { Header } from "@/components/site/Header";
import { LandingOfferCard } from "@/components/landing/LandingOfferCard";
import { getLandingBundle, type LandingBundle } from "@/lib/data/landingPages.functions";
import { getDestinationPageData, type OfferView } from "@/lib/data/destinations.functions";
import { LANDING_TYPE_LABEL, LANDING_TYPE_OFFERS } from "@/lib/data/landingTypes";
import { landingCoverAssets } from "@/lib/data/landingCoverAssets";
import { offerPhoto, type Photo } from "@/lib/data/destinationCardPhotos";
import { InlineOfferCta } from "@/components/landing/LandingOfferCard";
import { factItems, QuickFacts, SeasonPicker, SectionBlock, seasonOf, type LandingFacts } from "@/components/landing/DecisionBlocks";

const BASE = "https://minialife.com";

// Root-level search pages (e.g. /yosemite-things-to-do). Static routes such as
// /about or /destinations/* always win over this dynamic segment.
export const Route = createFileRoute("/$landing")({
  loader: async ({ params }) => {
    const bundle = await getLandingBundle({ data: { path: `/${params.landing}` } });
    if (!bundle) {
      // Short park addresses (e.g. /rocky-mountain) permanently redirect to the guide.
      const slug = params.landing.toLowerCase();
      if (/^[a-z0-9-]+$/.test(slug)) {
        const dest = await getDestinationPageData({ data: { slug } });
        if (dest) throw redirect({ to: "/destinations/$slug", params: { slug }, statusCode: 301 });
      }
      throw notFound();
    }
    const dest = await getDestinationPageData({ data: { slug: bundle.destination.slug } });
    const cats = LANDING_TYPE_OFFERS[bundle.page.pageType] ?? [];
    const slug = bundle.destination.slug;
    const tagged = dest
      ? [
          ...dest.stays.map((o, i) => ({ o, photo: offerPhoto(slug, "stay", i, `${o.title} ${o.subcategory ?? ""} ${o.partner ?? ""}`) })),
          ...dest.rentals.map((o, i) => ({ o, photo: offerPhoto(slug, "rental", i, `${o.title} ${o.subcategory ?? ""} ${o.partner ?? ""}`) })),
          ...dest.activities.map((o, i) => ({ o, photo: offerPhoto(slug, "activity", i) })),
        ]
      : [];
    const picked = tagged.filter((t) => cats.includes(t.o.category)).slice(0, 6);
    const offers: OfferView[] = picked.map((t) => t.o);
    const photos: (Photo | null)[] = picked.map((t) => t.photo ?? null);
    const facts: LandingFacts = {
      bestSeason: dest?.bestSeason ?? null,
      tripDays: dest?.tripDurationDays ?? null,
      airport: dest?.airportCode ?? null,
      driveMinutes: dest?.driveMinutes ?? null,
      permitLevel: dest?.permitLevel ?? null,
      dailyBudget: dest?.avgDailyBudget ?? null,
    };
    return { bundle, offers, photos, facts };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Page not found — Minialife" }, { name: "robots", content: "noindex" }] };
    }
    const { page, h1, destination, sections } = loaderData.bundle;
    const title = page.seoTitle ?? h1;
    const description = page.seoDescription ?? page.introContent ?? "";
    const url = page.canonicalUrl ?? `${BASE}${page.path}`;
    const coverImage = landingCoverAssets[page.path]
      ? `${BASE}${landingCoverAssets[page.path]}`
      : page.coverImage ?? destination.heroImage;
    const jsonLd = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: h1,
        description,
        image: coverImage || undefined,
        dateModified: page.updatedAt,
        mainEntityOfPage: url,
        publisher: { "@type": "Organization", name: "Minialife" },
        articleSection: sections.map((s) => s.heading),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
          { "@type": "ListItem", position: 2, name: destination.name, item: `${BASE}/destinations/${destination.slug}` },
          { "@type": "ListItem", position: 3, name: h1, item: url },
        ],
      },
    ]);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        ...(coverImage?.startsWith("https://")
          ? [
              { property: "og:image", content: coverImage },
              { name: "twitter:image", content: coverImage },
            ]
          : []),
        ...(page.indexable ? [] : [{ name: "robots", content: "noindex, follow" }]),
        { "script:ld+json": jsonLd },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: LandingPage,
  notFoundComponent: LandingNotFound,
});

function LandingNotFound() {
  return (
    <div className="bg-beige/30">
      <Header />
      <main className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="font-display text-4xl text-foreground">Page not found</h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          This page doesn't exist. Explore our destinations instead.
        </p>
        <Link to="/destinations" className="mt-8 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-off-white">
          All destinations
        </Link>
      </main>
      <Footer />
    </div>
  );
}

function ctaLead(pageType: string, category: string) {
  if (category === "activity") return pageType === "trip_planner" ? "Book for this day" : "Book this experience";
  if (category === "stay") return pageType === "best_time" ? "Lock in a stay for this season" : "Where to sleep";
  return "Get around";
}

function LandingPage() {
  const { bundle, offers, photos, facts } = Route.useLoaderData() as {
    bundle: LandingBundle; offers: OfferView[]; photos: (Photo | null)[]; facts: LandingFacts;
  };
  const rest = offers.slice(bundle.sections.length);
  const { page, h1, sections, destination, siblings } = bundle;
  const label = LANDING_TYPE_LABEL[page.pageType] ?? "Guide";
  const coverImage = landingCoverAssets[page.path] ?? page.coverImage ?? destination.heroImage;
  const usesDestinationPhoto = !landingCoverAssets[page.path] && !page.coverImage;
  const photoCredit = usesDestinationPhoto
    ? destination.photoCredit?.split(" · Gallery:")[0]?.replace(/^Hero:\s*/, "")
    : page.coverPhotoCredit;
  const photoSource = usesDestinationPhoto ? destination.heroImage : page.coverPhotoSource;
  const photoLicense = usesDestinationPhoto ? null : page.coverPhotoLicense;

  return (
    <div className="bg-beige/40">
      <Header />
      <section className={`relative ${coverImage ? "min-h-[340px] md:min-h-[420px]" : "bg-forest py-16 md:py-20"}`}>
        {coverImage && (
          <img src={coverImage} alt={`${destination.name} landscape`} className="absolute inset-0 h-full w-full object-cover" />
        )}
        {coverImage && <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />}
        <div className={`container-page relative ${coverImage ? "flex min-h-[340px] flex-col justify-end pb-8 md:min-h-[420px]" : ""}`}>
          <nav className="mb-3 flex flex-wrap items-center gap-1 text-xs text-off-white/80">
            <Link to="/" className="hover:underline">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/destinations/$slug" params={{ slug: destination.slug }} className="hover:underline">
              {destination.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span>{label}</span>
          </nav>
          <h1 className="max-w-3xl font-display text-3xl text-off-white md:text-5xl">{h1}</h1>
        </div>
      </section>
      {coverImage && photoCredit && photoSource && (
        <p className="container-page pt-2 text-[10px] text-muted-foreground">
          Photo: <a href={photoSource} target="_blank" rel="noopener noreferrer" className="underline">{photoCredit}</a>{photoLicense ? ` · ${photoLicense}` : ""}
        </p>
      )}

      <QuickFacts facts={facts} />

      <main className="container-page grid grid-cols-[minmax(0,1fr)] gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0 space-y-8 [overflow-wrap:anywhere]">
          {page.introContent && <p className="text-lg leading-relaxed text-foreground">{page.introContent}</p>}
          {page.pageType === "best_time" && <SeasonPicker sections={sections} />}
          {sections.map((s, i) => {
            const o = offers[i];
            const season = seasonOf(s);
            return (
              <div key={s.heading} id={season ? `season-${season.name.toLowerCase()}` : undefined} className="scroll-mt-24">
                <SectionBlock
                  section={s}
                  index={i}
                  cta={o ? <InlineOfferCta offer={o} destinationSlug={destination.slug} photo={photos[i] ?? undefined} lead={ctaLead(page.pageType, o.category)} /> : undefined}
                />
              </div>
            );
          })}

          {rest.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-2xl text-foreground">More ways to book {destination.name}</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rest.map((o, j) => (
                  <LandingOfferCard key={o.id} offer={o} destinationSlug={destination.slug} photo={photos[sections.length + j] ?? undefined} />
                ))}
              </div>
            </section>
          )}
          <ViatorPlaceBlock slug={destination.slug} name={destination.name} />
        </article>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-forest p-5 text-off-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-off-white/70">Your trip planner</p>
            <ul className="mt-3 space-y-2.5">
              {factItems(facts).map((f) => (
                <li key={f.label} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                  <span><span className="text-off-white/70">{f.label}:</span> {f.value}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/destinations/$slug"
              params={{ slug: destination.slug }}
              className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-copper px-4 py-2.5 text-xs font-semibold text-off-white"
            >
              Build my {destination.name} plan <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <p className="mt-2 text-center text-[10px] text-off-white/60">Stays, rentals, budget, road trip map & gear</p>
          </div>
          {siblings.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sage-deep">More guides</p>
              <ul className="mt-3 space-y-2">
                {siblings.map((s) => (
                  <li key={s.path}>
                    <Link
                      to="/$landing"
                      params={{ landing: s.path.slice(1) }}
                      className="text-sm font-medium text-foreground hover:underline"
                    >
                      {LANDING_TYPE_LABEL[s.pageType] ?? s.pageType}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </main>
      <Footer />
    </div>
  );
}
