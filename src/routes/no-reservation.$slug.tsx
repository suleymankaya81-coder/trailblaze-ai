import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, ShieldAlert } from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ArrivalPlan } from "@/components/flydrive/FlyDriveSections";
import { DestTile, FullGuideLink, GuideFaq, GuideHero, GuideSection, HeroChip, ReservationPanel } from "@/components/guides/GuideSections";
import { getDestinationPageData } from "@/lib/data/destinations.functions";
import { getGuideAlternatives } from "@/lib/data/guides.functions";
import { getDestinationAnswers } from "@/lib/data/destinationAnswers";
import { SITE, formatDriveShort } from "@/lib/seo/flyDrive";
import { PILOT, destGuideJsonLd, isNoReservationEligible, jsonLdScript, noReservationFaqs, reservationNote } from "@/lib/seo/guides";

export const Route = createFileRoute("/no-reservation/$slug")({
  loader: async ({ params }) => {
    const dest = await getDestinationPageData({ data: { slug: params.slug } }).catch(() => null);
    if (!dest || !isNoReservationEligible(dest)) throw notFound();
    // Pilot phase: only reviewed pilot pages render; all stay noindex.
    if (!(PILOT.noReservation as readonly string[]).includes(dest.slug)) throw notFound();
    const altSlugs = dest.similar.map((s) => s.slug);
    const alts = altSlugs.length ? (await getGuideAlternatives({ data: { slugs: altSlugs } })).filter((a) => a.permitLevel === "none") : [];
    return { dest, alts, faqs: noReservationFaqs(dest), url: `${SITE}/no-reservation/${dest.slug}` };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Unavailable — MiniaLife" }, { name: "robots", content: "noindex" }] };
    const { dest, faqs, url } = loaderData;
    const title = `${dest.name} Without a Reservation: Entry Rules & Backup Plans — MiniaLife`;
    const description = `Missed a booking for ${dest.name}? What needs a reservation, timing tips to get in, nearby places with no entry booking, and flights, car and first night.`;
    const img = dest.heroImage.startsWith("https://") ? dest.heroImage : null;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "robots", content: "noindex" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: jsonLdScript(destGuideJsonLd({ ...dest, faqs, url, label: "No reservation", title })) }],
    };
  },
  component: Page,
  errorComponent: () => <div className="container-page py-20">This guide could not load. Please try again.</div>,
  notFoundComponent: () => <div className="container-page py-20">This guide does not exist.</div>,
});

function Page() {
  const { dest, alts, faqs } = Route.useLoaderData();
  const reviewed = getDestinationAnswers(dest.slug)?.reservation;
  const tips = dest.travelPlan?.intel.filter((t) => t.kind === "timing" || t.kind === "access" || t.kind === "parking") ?? [];
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <GuideHero
          image={dest.heroImage}
          kicker="No-reservation guide"
          title={`${dest.name} without a reservation`}
          crumbs={<><Link to="/" className="hover:underline">Home</Link> / <Link to="/destinations/$slug" params={{ slug: dest.slug }} className="hover:underline">{dest.name}</Link> / No reservation</>}
        >
          <HeroChip icon={<ShieldAlert className="h-4 w-4" />}>{dest.permitLevel === "high" ? "Bookings: high demand" : "Bookings: moderate demand"}</HeroChip>
          {dest.driveMinutes != null && <HeroChip icon={<Clock className="h-4 w-4" />}>{formatDriveShort(dest.driveMinutes)} from {dest.airportCode}</HeroChip>}
        </GuideHero>

        <GuideSection title="What needs booking">
          <ReservationPanel headline={reviewed ? null : dest.permitHeadline} note={reservationNote(dest)!} sourceUrl={reviewed?.sourceUrl ?? dest.permitSourceUrl} />
        </GuideSection>

        {tips.length > 0 && (
          <GuideSection title="How to still get in" intro="Local timing and access notes for this place. Rules change; confirm on the official source before you go.">
            <div className="grid gap-4 md:grid-cols-3">
              {tips.map((t) => (
                <div key={t.kind} className="rounded-3xl border border-border bg-card p-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{t.kind}</p>
                  <p className="mt-2 font-display text-lg font-semibold text-foreground">{t.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
                </div>
              ))}
            </div>
          </GuideSection>
        )}

        {alts.length > 0 && (
          <GuideSection title="Nearby, no entry booking" intro="Similar places marked in our data as not needing an entry permit.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {alts.map((a) => <DestTile key={a.slug} slug={a.slug} name={a.name} image={a.heroImage} meta="No entry permit" />)}
            </div>
          </GuideSection>
        )}

        {dest.airportCode && (
          <GuideSection title="Book the rest now" intro="Flights, car and first night don't depend on park entry — lock them in early.">
            <ArrivalPlan dest={dest} />
          </GuideSection>
        )}

        <GuideSection title="Quick answers"><GuideFaq faqs={faqs} /></GuideSection>
        <section className="container-page pb-16"><FullGuideLink slug={dest.slug} name={dest.name} /></section>
      </main>
      <Footer />
    </div>
  );
}
