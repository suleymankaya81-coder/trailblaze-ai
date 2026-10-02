import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, ChevronRight } from "lucide-react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { LandingOfferCard } from "@/components/landing/LandingOfferCard";
import { getLandingBundle, type LandingBundle } from "@/lib/data/landingPages.functions";
import { getDestinationPageData, type OfferView } from "@/lib/data/destinations.functions";
import { LANDING_TYPE_LABEL, LANDING_TYPE_OFFERS } from "@/lib/data/landingTypes";

const BASE = "https://minialife.com";

// Root-level search pages (e.g. /yosemite-things-to-do). Static routes such as
// /about or /destinations/* always win over this dynamic segment.
export const Route = createFileRoute("/$landing")({
  loader: async ({ params }) => {
    const bundle = await getLandingBundle({ data: { path: `/${params.landing}` } });
    if (!bundle) throw notFound();
    const dest = await getDestinationPageData({ data: { slug: bundle.destination.slug } });
    const cats = LANDING_TYPE_OFFERS[bundle.page.pageType] ?? [];
    const offers: OfferView[] = dest
      ? [...dest.stays, ...dest.rentals, ...dest.activities].filter((o) => cats.includes(o.category)).slice(0, 6)
      : [];
    return { bundle, offers };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Page not found — Minialife" }, { name: "robots", content: "noindex" }] };
    }
    const { page, h1, destination, sections } = loaderData.bundle;
    const title = page.seoTitle ?? h1;
    const description = page.seoDescription ?? page.introContent ?? "";
    const url = page.canonicalUrl ?? `${BASE}${page.path}`;
    const jsonLd = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: h1,
        description,
        image: destination.heroImage || undefined,
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
        ...(destination.heroImage
          ? [
              { property: "og:image", content: destination.heroImage },
              { name: "twitter:image", content: destination.heroImage },
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

function LandingPage() {
  const { bundle, offers } = Route.useLoaderData() as { bundle: LandingBundle; offers: OfferView[] };
  const { page, h1, sections, destination, siblings } = bundle;
  const label = LANDING_TYPE_LABEL[page.pageType] ?? "Guide";

  return (
    <div className="bg-beige/40">
      <Header />
      <section className="relative">
        {destination.heroImage && (
          <img src={destination.heroImage} alt={destination.name} className="h-[340px] w-full object-cover md:h-[420px]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
        <div className="container-page absolute inset-x-0 bottom-0 pb-8">
          <nav className="mb-3 flex items-center gap-1 text-xs text-off-white/80">
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
      {destination.photoCredit && (
        <p className="container-page pt-2 text-[10px] text-muted-foreground">Photo: {destination.photoCredit}</p>
      )}

      <main className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="space-y-10">
          {page.introContent && <p className="text-lg leading-relaxed text-foreground">{page.introContent}</p>}
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="mb-3 font-display text-2xl text-foreground">{s.heading}</h2>
              {s.body.split(/\n\n+/).map((p, i) => (
                <p key={i} className="mb-3 leading-relaxed text-muted-foreground">{p}</p>
              ))}
            </section>
          ))}

          {offers.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-2xl text-foreground">Book it for {destination.name}</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {offers.map((o) => (
                  <LandingOfferCard key={o.id} offer={o} destinationSlug={destination.slug} />
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sage-deep">Full trip guide</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Stays, rentals, budget, road trip map and packing list for {destination.name}.
            </p>
            <Link
              to="/destinations/$slug"
              params={{ slug: destination.slug }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-off-white"
            >
              Plan your {destination.name} trip <ArrowRight className="h-3.5 w-3.5" />
            </Link>
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
