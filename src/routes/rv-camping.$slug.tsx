import { createFileRoute, Link, notFound } from "@tanstack/react-router";
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
import { getDestinationAnswers } from "@/lib/data/destinationAnswers";
import { servicePhoto } from "@/lib/data/servicePhotos";
import { partnerLabel } from "@/lib/affiliates/compliance";
import { SITE, formatDriveShort } from "@/lib/seo/flyDrive";
import { destGuideJsonLd, isRvEligible, jsonLdScript, reservationNote, rvFaqs } from "@/lib/seo/guides";

const CAMP_PARTNERS = new Set(["campspot", "roverpass"]);

export const Route = createFileRoute("/rv-camping/$slug")({
  loader: async ({ params }) => {
    const dest = await getDestinationPageData({ data: { slug: params.slug } }).catch(() => null);
    if (!dest || !isRvEligible(dest)) throw notFound();
    return { dest, faqs: rvFaqs(dest), url: `${SITE}/rv-camping/${dest.slug}` };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Unavailable — MiniaLife" }, { name: "robots", content: "noindex" }] };
    const { dest, faqs, url } = loaderData;
    const title = `${dest.name} by RV: Campgrounds, RV Parks & Route — MiniaLife`;
    const description = `Plan an RV or camping trip to ${dest.name}: drive from ${dest.airportCode}, campground and RV-park booking, overnight stops, rentals and vehicle tips.`;
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
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: jsonLdScript(destGuideJsonLd({ ...dest, faqs, url, label: "RV & camping", title })) }],
    };
  },
  component: Page,
  errorComponent: () => <div className="container-page py-20">This guide could not load. Please try again.</div>,
  notFoundComponent: () => <div className="container-page py-20">This guide does not exist.</div>,
});

function Page() {
  const { dest, faqs } = Route.useLoaderData();
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
          crumbs={<><Link to="/" className="hover:underline">Home</Link> / <Link to="/destinations/$slug" params={{ slug: dest.slug }} className="hover:underline">{dest.name}</Link> / RV & camping</>}
        >
          <HeroChip icon={<Clock className="h-4 w-4" />}>{formatDriveShort(dest.driveMinutes!)} from {dest.airportCode}</HeroChip>
          <HeroChip icon={<Tent className="h-4 w-4" />}>Camping score {dest.campingScore}/10</HeroChip>
        </GuideHero>
        <section className="container-page -mt-10 relative"><RouteCard dest={dest} /></section>

        {plan && (
          <GuideSection title="Vehicle & road notes">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-border bg-sand/40 p-6 md:col-span-3 md:p-8">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><Caravan className="h-4 w-4" /> Which vehicle</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{plan.vehicle}</p>
              </div>
              {roadTips.map((t) => (
                <div key={t.kind} className="rounded-3xl border border-border bg-card p-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{t.kind}</p>
                  <p className="mt-2 font-display text-lg font-semibold text-foreground">{t.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
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

        <GuideSection title={`Where to park the rig near ${dest.name}`} intro="Private campgrounds and RV parks outside the park, plus overnight stops for members.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {camps.map((o, i) => {
              const photo = servicePhoto("rvpark", `${dest.slug}:${o.id}`, i);
              return photo ? <PartnerPhotoCard key={o.id} brand={partnerLabel(o.partner) ?? "Partner"} title={o.title} href={o.externalUrl!} photo={photo} detail={o.whyRecommended ?? undefined} /> : null;
            })}
          </div>
          <div className="mt-6"><HarvestHostsCard destinationName={dest.name} /></div>
        </GuideSection>

        {rentals.length > 0 && (
          <GuideSection title="Rent a motorhome or campervan" intro="Fleet rentals from established depots. Compare pick-up cities against your flight.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rentals.map((o, i) => {
                const photo = servicePhoto(/campervan/i.test(o.title) ? "campervan" : "rv", `${dest.slug}:${o.id}`, i);
                return photo ? <PartnerPhotoCard key={o.id} brand="Motorhome Republic" title={o.title} href={o.externalUrl!} photo={photo} detail={o.whyRecommended ?? undefined} /> : null;
              })}
            </div>
          </GuideSection>
        )}

        <GuideSection title="Prefer a car and campground trip?">
          <div className="grid gap-4 sm:grid-cols-2"><AirportRentalsCards slug={dest.slug} airportCode={dest.airportCode} /></div>
        </GuideSection>
        <section className="container-page pb-6"><ViatorPlaceBlock slug={dest.slug} name={dest.name} /></section>
        <GuideSection title="Quick answers"><GuideFaq faqs={faqs} /></GuideSection>
        <section className="container-page pb-16"><FullGuideLink slug={dest.slug} name={dest.name} /></section>
      </main>
      <Footer />
    </div>
  );
}
