import { T } from "@/lib/i18n";
import type * as React from "react";
import { deAlternates } from "@/lib/i18n/deTemplate";
import { Thumb, SwipeRow } from "@/components/ui-kit";
import roadImg from "@/assets/thumbs/road.jpg";
import planImg from "@/assets/thumbs/plan.jpg";
import flightImg from "@/assets/thumbs/flight.jpg";
import carImg from "@/assets/thumbs/car.jpg";
import { BookingStepsStrip } from "@/components/guides/BookingStepsStrip";
import { TripSnapshot, TripQuickNav } from "@/components/destination/TripSnapshot";
import { TripEssentials } from "@/components/destination/TripEssentials";
import { Link } from "@/components/site/LocalLink";
import { createFileRoute, notFound, useLoaderData } from "@tanstack/react-router";
import { ViatorPlaceBlock } from "@/components/destination/ViatorPlaceBlock";
import { Clock, ShieldAlert } from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ArrivalPlan } from "@/components/flydrive/FlyDriveSections";
import { DestTile, FullGuideLink, GuideFaq, GuideHero, GuideSection, HeroChip, ReservationPanel } from "@/components/guides/GuideSections";
import { getDestinationPageData } from "@/lib/data/destinations.functions";
import { getLandingLinksForDestination } from "@/lib/data/landingPages.functions";
import { placeGuideCrumbs } from "@/lib/seo/breadcrumbs";
import { PlanDeeper } from "@/components/guides/PlanDeeper";
import { getGuideAlternatives } from "@/lib/data/guides.functions";
import { getDestinationAnswers } from "@/lib/data/destinationAnswers";
import { SITE, formatDriveShort } from "@/lib/seo/flyDrive";
import { destGuideJsonLd, isNoReservationEligible, jsonLdScript, noReservationFaqs, reservationNote } from "@/lib/seo/guides";
import { noReservationDescription, noReservationTitle } from "@/lib/seo/guidesSeo";

const loadPage = async ({ params }: { params: { slug: string } }) => {
  const dest = await getDestinationPageData({ data: { slug: params.slug } }).catch(() => null);
  if (!dest || !isNoReservationEligible(dest)) throw notFound();
  const altSlugs = dest.similar.map((s) => s.slug);
  const alts = altSlugs.length ? (await getGuideAlternatives({ data: { slugs: altSlugs } })).filter((a) => a.permitLevel === "none") : [];
  const landingLinks = await getLandingLinksForDestination({ data: { destinationId: dest.id } }).catch(() => []);
  return { dest, landingLinks, alts, faqs: noReservationFaqs(dest), url: `${SITE}/no-reservation/${dest.slug}` };
};

export const Route = createFileRoute("/no-reservation/$slug")({
  loader: loadPage,
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Unavailable — MiniaLife" }, { name: "robots", content: "noindex" }] };
    const { dest, faqs, url } = loaderData;
    const title = noReservationTitle(dest);
    const description = noReservationDescription(dest);
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
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
      links: [{ rel: "canonical", href: url }, ...deAlternates(url)],
      scripts: [{ type: "application/ld+json", children: jsonLdScript(destGuideJsonLd({ ...dest, faqs, url, label: "No reservation", title })) }],
    };
  },
  component: Page,
  errorComponent: () => <div className="container-page py-20">This guide could not load. Please try again.</div>,
  notFoundComponent: () => <div className="container-page py-20">This guide does not exist.</div>,
});

export function Page(): React.ReactElement {
  const { dest, alts, faqs, landingLinks } = (useLoaderData({ strict: false }) as Awaited<ReturnType<typeof loadPage>>);
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
          crumbs={placeGuideCrumbs(dest, "No reservation", `/no-reservation/${dest.slug}`)}
        >
          <HeroChip image={roadImg}>{dest.permitLevel === "high" ? "Bookings: high demand" : "Bookings: moderate demand"}</HeroChip>
          {dest.driveMinutes != null && <HeroChip image={roadImg}>{formatDriveShort(dest.driveMinutes)} from {dest.airportCode}</HeroChip>}
        </GuideHero>
        <TripSnapshot trip={dest} /><TripQuickNav />
        <div id="trip-booking" className="container-page py-6"><BookingStepsStrip slug={dest.slug} name={dest.name} airportCode={dest.airportCode} /></div>
        <div id="trip-plan" />

        <GuideSection title="What needs booking">
          <ReservationPanel headline={reviewed ? null : dest.permitHeadline} note={reservationNote(dest) ?? "Check the current official reservation rules before booking."} sourceUrl={reviewed?.sourceUrl ?? dest.permitSourceUrl} />
        </GuideSection>

        {tips.length > 0 && (
          <GuideSection title="How to still get in" intro="Local timing and access notes for this place. Rules change; confirm on the official source before you go.">
            <div className="grid gap-4 md:grid-cols-3">
              {tips.map((t) => (
                <div key={t.kind} className="rounded-lg border border-border bg-card p-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground"><T>{t.kind}</T></p>
                  <p className="mt-2 font-display text-lg font-semibold text-foreground"><T>{t.title}</T></p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground"><T>{t.text}</T></p>
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
          <GuideSection title="Flights, vehicles & your first night" intro="Confirm your entry plans and cancellation terms before committing to flights, a vehicle and lodging.">
            <ArrivalPlan dest={dest} />
          </GuideSection>
        )}

        <section className="container-page pb-6"><ViatorPlaceBlock slug={dest.slug} name={dest.name} /></section>
        <section className="container-page py-10"><TripEssentials context={{ slug: dest.slug, name: dest.name, places: [dest] }} /></section>
        <GuideSection title="Quick answers"><GuideFaq faqs={faqs} /></GuideSection>
        <section className="container-page pb-16"><FullGuideLink slug={dest.slug} name={dest.name} /><div className="mt-8"><PlanDeeper dest={dest} landingLinks={landingLinks} current="no-reservation" /></div></section>
      </main>
      <Footer />
    </div>
  );
}
