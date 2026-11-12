import { T } from "@/lib/i18n";
import { DailyRoutes } from "@/components/guides/DailyRoutes";
import { travelDescription } from "@/lib/seo/travelMetadata";
import type * as React from "react";
import { deAlternates } from "@/lib/i18n/deTemplate";
import { Thumb, SwipeRow } from "@/components/ui-kit";
import roadImg from "@/assets/thumbs/road.jpg";
import planImg from "@/assets/thumbs/plan.jpg";
import flightImg from "@/assets/thumbs/flight.jpg";
import carImg from "@/assets/thumbs/car.jpg";
import { BookingStepsStrip } from "@/components/guides/BookingStepsStrip";
import { TripSnapshot, TripQuickNav } from "@/components/destination/TripSnapshot";
import { estimatedFrom } from "@/lib/data/servicePhotos";
import { TripEssentials } from "@/components/destination/TripEssentials";
import { Link } from "@/components/site/LocalLink";
import { createFileRoute, notFound, useLoaderData } from "@tanstack/react-router";
import { ViatorPlaceBlock } from "@/components/destination/ViatorPlaceBlock";
import { Caravan, Clock, Tent } from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { RouteCard } from "@/components/flydrive/FlyDriveSections";
import { HarvestHostsCard } from "@/components/destination/HarvestHostsCard";
import { PartnerPhotoCard } from "@/components/destination/PartnerPhotoCard";
import { AirportRentalsCards } from "@/components/destination/AirportRentalsCards";
import { FullGuideLink, GuideFaq, GuideHero, GuideSection, HeroChip, ReservationPanel } from "@/components/guides/GuideSections";
import { getDestinationPageData } from "@/lib/data/destinations.functions";
import { getLandingLinksForDestination } from "@/lib/data/landingPages.functions";
import { placeGuideCrumbs } from "@/lib/seo/breadcrumbs";
import { PlanDeeper } from "@/components/guides/PlanDeeper";
import { getDestinationAnswers } from "@/lib/data/destinationAnswers";
import { servicePhoto } from "@/lib/data/servicePhotos";
import { partnerLabel } from "@/lib/affiliates/compliance";
import { SITE, formatDriveShort } from "@/lib/seo/flyDrive";
import { destGuideJsonLd, isRvEligible, jsonLdScript, reservationNote, rvFaqs } from "@/lib/seo/guides";
import { rvCampingDescription, rvCampingTitle } from "@/lib/seo/guidesSeo";

const CAMP_PARTNERS = new Set(["campspot", "roverpass"]);

const loadPage = async ({ params }: { params: { slug: string } }) => {
  const dest = await getDestinationPageData({ data: { slug: params.slug } }).catch(() => null);
  if (!dest || !isRvEligible(dest)) throw notFound();
  const landingLinks = await getLandingLinksForDestination({ data: { destinationId: dest.id } }).catch(() => []);
  return { dest, landingLinks, faqs: rvFaqs(dest), url: `${SITE}/rv-camping/${dest.slug}` };
};

export const Route = createFileRoute("/rv-camping/$slug")({
  loader: loadPage,
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Unavailable — WildParkRoutes" }, { name: "robots", content: "noindex" }] };
    const { dest, faqs, url } = loaderData;
    const title = rvCampingTitle(dest);
    const description = travelDescription(dest, "rv-camping", rvCampingDescription(dest));
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
      scripts: [{ type: "application/ld+json", children: jsonLdScript(destGuideJsonLd({ ...dest, faqs, url, label: "RV & camping", title })) }],
    };
  },
  component: Page,
  errorComponent: () => <div className="container-page py-20">This guide could not load. Please try again.</div>,
  notFoundComponent: () => <div className="container-page py-20">This guide does not exist.</div>,
});

export function Page(): React.ReactElement {
  const { dest, faqs, landingLinks } = (useLoaderData({ strict: false }) as Awaited<ReturnType<typeof loadPage>>);
  const camps = dest.stays.filter((o) => o.partner && CAMP_PARTNERS.has(o.partner) && o.externalUrl).slice(0, 3);
  const rentals = dest.rentals.filter((o) => o.partner === "motorhome_republic" && o.externalUrl).slice(0, 3);
  const plan = dest.travelPlan;
  const roadTips = plan?.intel.filter((t) => t.kind === "fuel" || t.kind === "signal" || t.kind === "parking") ?? [];
  const note = reservationNote(dest);
  const reviewed = getDestinationAnswers(dest.slug)?.reservation;
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <GuideHero
          image={dest.heroImage}
          kicker="RV & camping guide"
          title={`${dest.name} by RV`}
          crumbs={placeGuideCrumbs(dest, "RV & camping", `/rv-camping/${dest.slug}`)}
        >
          <HeroChip image={roadImg}>{formatDriveShort(dest.driveMinutes ?? 0)} from {dest.airportCode}</HeroChip>
          <HeroChip image={roadImg}>Camping score {dest.campingScore}/10</HeroChip>
        </GuideHero>
        <TripSnapshot trip={dest} /><TripQuickNav />
        <div id="trip-booking" className="container-page py-6"><BookingStepsStrip slug={dest.slug} name={dest.name} airportCode={dest.airportCode} /></div>
        <div id="trip-plan" />
        <section className="container-page py-6"><RouteCard dest={dest} /></section>

        {plan && (
          <GuideSection title="Vehicle & road notes">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border-l-2 border-primary bg-sand/40 p-6 md:col-span-3 md:p-8">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><Thumb src={carImg} size={40} /> Which vehicle</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85"><T>{plan.vehicle}</T></p>
              </div>
              {roadTips.map((t) => (
                <div key={t.kind} className="rounded-lg border border-border bg-card p-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground"><T>{t.kind}</T></p>
                  <p className="mt-2 font-display text-lg font-semibold text-foreground"><T>{t.title}</T></p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground"><T>{t.text}</T></p>
                </div>
              ))}
            </div>
          </GuideSection>
        )}

        {note && (
          <GuideSection title="Campground reservations">
            <ReservationPanel headline={reviewed ? null : dest.permitHeadline} note={note} sourceUrl={reviewed?.sourceUrl ?? dest.permitSourceUrl} />
          </GuideSection>
        )}

        {rentals.length > 0 && (
          <GuideSection title="2 · Choose a motorhome or campervan" intro="Fleet rentals from established depots. Compare pick-up cities against your flight.">
            <div className="travel-card-row sm:grid-cols-2 lg:grid-cols-3">
              {rentals.map((o, i) => {
                const photo = servicePhoto(/campervan/i.test(o.title) ? "campervan" : "rv", `${dest.slug}:${o.id}`, i);
                return photo ? <PartnerPhotoCard key={o.id} brand="Motorhome Republic" title={o.title} href={o.externalUrl ?? ""} photo={photo} detail={o.whyRecommended ?? undefined} price={o.priceDisplay ?? estimatedFrom("motorhome")} cta="Compare RV & campervan rates" /> : null;
              })}
            </div>
          </GuideSection>
        )}

        <GuideSection title="Prefer a car and campground trip?">
          <div className="travel-card-row sm:grid-cols-2"><AirportRentalsCards slug={dest.slug} airportCode={dest.airportCode} /></div>
        </GuideSection>
        <GuideSection title={`3 · Where to park the rig near ${dest.name}`} intro="Private campgrounds and RV parks outside the park, plus overnight stops for members.">
          <div className="travel-card-row sm:grid-cols-2 lg:grid-cols-3">
            {camps.map((o, i) => {
              const photo = servicePhoto("rvpark", `${dest.slug}:${o.id}`, i);
              return photo ? <PartnerPhotoCard key={o.id} brand={partnerLabel(o.partner) ?? "Partner"} title={o.title} href={o.externalUrl ?? ""} photo={photo} detail={o.whyRecommended ?? undefined} cta="Check campground availability" price={o.priceDisplay ?? (o.priceValue != null ? `From $${o.priceValue}/${o.priceUnit ?? "night"}` : undefined)} /> : null;
            })}
          </div>
          <div className="mt-6"><HarvestHostsCard destinationName={dest.name} /></div>
        </GuideSection>

        <DailyRoutes dest={dest} />
        <section className="container-page pb-6"><ViatorPlaceBlock slug={dest.slug} name={dest.name} /></section>
        <section className="container-page py-10"><TripEssentials context={{ slug: `rv-${dest.slug}`, name: dest.name, places: [dest], mode: "camping" }} /></section>
        <GuideSection title="Quick answers"><GuideFaq faqs={faqs} /></GuideSection>
        <section className="container-page pb-16"><FullGuideLink slug={dest.slug} name={dest.name} /><div className="mt-8"><PlanDeeper dest={dest} landingLinks={landingLinks} current="rv-camping" /></div></section>
      </main>
      <Footer />
    </div>
  );
}
