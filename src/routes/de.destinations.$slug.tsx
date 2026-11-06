import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SafeImage } from "@/components/shared/SafeImage";
import { getDestinationPageData } from "@/lib/data/destinations.functions";
import { getDestinationTranslation } from "@/lib/data/translations.functions";
import { t } from "@/lib/i18n";
import { DESTINATIONS_DE, HOME_DE, deMeta } from "@/lib/i18n/deSeo";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { hreflangLinks } from "@/lib/seo/hreflang";

export const Route = createFileRoute("/de/destinations/$slug")({
  loader: async ({ params }) => {
    const [tr, dest] = await Promise.all([
      getDestinationTranslation({ data: { slug: params.slug, locale: "de" } }),
      getDestinationPageData({ data: { slug: params.slug } }),
    ]);
    if (!tr || !dest) throw notFound();
    return { tr, slug: dest.slug, heroImage: dest.heroImage, permitSourceUrl: dest.permitSourceUrl };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Nicht verfügbar — MiniaLife" }, { name: "robots", content: "noindex" }] };
    const { tr, slug, heroImage } = loaderData;
    const url = `https://minialife.com/de/destinations/${slug}`;
    const crumbs = [HOME_DE, DESTINATIONS_DE, { name: tr.name, path: `/de/destinations/${slug}` }];
    return {
      meta: [
        ...deMeta(tr.metaTitle, tr.metaDescription, url),
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(heroImage.startsWith("https://") ? [{ property: "og:image", content: heroImage }, { name: "twitter:image", content: heroImage }] : []),
      ],
      links: [{ rel: "canonical", href: url }, ...hreflangLinks(`/destinations/${slug}`, ["en", "de"])],
      scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", ...breadcrumbJsonLd(crumbs) }).replace(/</g, "\\u003c") }],
    };
  },
  component: Page,
});

function Page() {
  const { tr, slug, heroImage, permitSourceUrl } = Route.useLoaderData();
  const crumbs = [HOME_DE, DESTINATIONS_DE, { name: tr.name, path: `/de/destinations/${slug}` }];
  const extras = [
    ["plan.arrival", tr.arrival],
    ["plan.vehicle", tr.vehicle],
    ["plan.goldenHour", tr.goldenHour],
  ] as const;
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="relative isolate overflow-hidden bg-forest">
        <SafeImage src={heroImage} alt={tr.name} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-foreground/85 via-foreground/60 to-foreground/20" />
        <div className="container-page py-16 md:py-24">
          <Breadcrumbs crumbs={crumbs} className="mb-6 text-background/80" />
          {tr.region && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background/80">{tr.region}</p>}
          <h1 className="mt-3 max-w-3xl font-display text-[34px] leading-tight text-background md:text-[56px]">{tr.name}</h1>
          {tr.tagline && <p className="mt-4 max-w-2xl text-base text-background/85 md:text-lg">{tr.tagline}</p>}
        </div>
      </section>
      <main className="container-page space-y-12 py-10 md:py-14">
        <div className="grid gap-5 md:grid-cols-2">
          {tr.bestSeason && (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-deep">{t("de", "plan.bestSeason")}</p>
              <p className="mt-2 text-foreground">{tr.bestSeason}</p>
            </div>
          )}
          {tr.permitNote && (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-deep">{t("de", "plan.reservation")}{tr.permitHeadline ? ` · ${tr.permitHeadline}` : ""}</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{tr.permitNote}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("de", "plan.checkOfficial")}{" "}
                {permitSourceUrl && <a href={permitSourceUrl} target="_blank" rel="noopener noreferrer" className="underline">↗</a>}
              </p>
            </div>
          )}
        </div>

        {tr.days.length > 0 && (
          <section>
            <h2 className="font-display text-3xl text-foreground">{t("de", "plan.days")}</h2>
            <ol className="mt-6 space-y-5">
              {tr.days.map((d, i) => (
                <li key={i} className="rounded-xl border border-border bg-card p-5 md:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-deep">{t("de", "plan.day")} {i + 1} · {d.start}</p>
                  <h3 className="mt-1 text-xl text-foreground">{d.title}</h3>
                  <ul className="mt-3 space-y-2">
                    {d.stops.map((s) => <li key={s.name} className="text-sm leading-relaxed text-foreground"><strong>{s.name}</strong> — {s.detail}</li>)}
                  </ul>
                  <p className="mt-3 text-sm text-muted-foreground"><strong>{t("de", "plan.driving")}:</strong> {d.driving}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{d.note}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {tr.intel.length > 0 && (
          <section>
            <h2 className="font-display text-3xl text-foreground">{t("de", "plan.intel")}</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {tr.intel.map((x) => (
                <div key={x.title} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-lg text-foreground">{x.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{x.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid gap-5 md:grid-cols-3">
          {extras.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-deep">{t("de", k)}</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{v}</p>
            </div>
          ))}
        </div>

        <section className="rounded-xl bg-forest p-6 text-off-white md:p-10">
          <h2 className="font-display text-2xl md:text-3xl">{t("de", "plan.book")}</h2>
          <p className="mt-2 max-w-xl text-sm opacity-90">{t("de", "plan.bookIntro")}</p>
          <Link to="/destinations/$slug" params={{ slug }} hrefLang="en" className="mt-5 inline-flex min-h-12 items-center rounded-md bg-background px-5 text-sm font-semibold text-foreground">{t("de", "plan.bookCta")}</Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
