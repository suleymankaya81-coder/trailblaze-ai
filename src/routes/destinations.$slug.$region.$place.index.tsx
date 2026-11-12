import { SITE_ORIGIN } from "@/config/site";
import { DestinationPageView } from "@/components/destination/DestinationPageView";
import { travelDescription } from "@/lib/seo/travelMetadata";
import { hreflangLinks } from "@/lib/seo/hreflang";
import { getDestinationLocales } from "@/lib/data/translations.functions";
import { isLocale } from "@/lib/i18n/locales";
import { TripSnapshot, TripQuickNav } from "@/components/destination/TripSnapshot";
import { offerCtaLabel } from "@/lib/affiliates/ctaLabel";
import { SafeImage } from "@/components/shared/SafeImage";
import { PhotoCredit } from "@/components/shared/PhotoCredit";
import { PlaceCard, SwipeRow, Thumb } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import planImage from "@/assets/thumbs/plan.jpg";
import carImage from "@/assets/thumbs/car.jpg";
import stayImage from "@/assets/thumbs/stay.jpg";
import gearImage from "@/assets/thumbs/gear.jpg";
import roadImage from "@/assets/thumbs/road.jpg";
import mapImage from "@/assets/thumbs/map.jpg";
import { TripEssentials } from "@/components/destination/TripEssentials";
import { estimatedFrom } from "@/lib/data/servicePhotos";
import { Link } from "@/components/site/LocalLink";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { destinationPath } from "@/lib/routes/paths";
import { getDestinationGeo } from "@/lib/data/geo.functions";
import { VrboExpediaItems } from "@/components/destination/VrboSearchWidget";
import { HarvestHostsOffer, HARVEST_HOSTS_URL } from "@/components/destination/HarvestHostsCard";
import { GettingThereItems, TourTicketItems } from "@/components/destination/TravelpayoutsCards";
import { servicePhoto } from "@/lib/data/servicePhotos";
import { GetYourGuideWidget } from "@/components/destination/PartnerWidget";
import { ViatorPlaceBlock } from "@/components/destination/ViatorPlaceBlock";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Coffee,
  CreditCard,
  DollarSign,
  Fuel,
  Heart,
  Hotel,
  Luggage,
  Map,
  MapPin,
  Mountain,
  Navigation,
  Ruler,
  Shield,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Star,
  Sun,
  Tent,
  Trees,
  Truck,
  Users,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { VehicleChooser, VEHICLE_PILOT_SLUGS, type VehiclePick } from "@/components/destination/VehicleChooser";
import { ClientOnly } from "@tanstack/react-router";
import { BookingStepsStrip } from "@/components/guides/BookingStepsStrip";
import { JumpBar, TripRadar, formatDrive } from "@/components/destination/TripRadar";
import routes from "@/data/routes.json";
import { TravelFlow, LocalIntel } from "@/components/destination/TravelFlow";
import { DestinationAnswers } from "@/components/destination/DestinationAnswers";

const RoadTripMap = lazy(() => import("@/components/destination/RoadTripMap"));
const ROUTES = routes as unknown as Record<string, [number, number][]>;

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDestinationPageData,
  type DestinationView,
  type OfferView,
} from "@/lib/data/destinations.functions";
import { enrichDestination, type EnrichResult } from "@/lib/ai/enrich.functions";
import { trackAndRedirect } from "@/lib/affiliates/track.functions";
import { getOrCreateSessionId } from "@/lib/affiliates/session";
import { outboundLinkTitle } from "@/lib/affiliates/compliance";
import { buildDestinationJsonLd } from "@/lib/seo/destinationJsonLd";
import { saveTripPlan } from "@/lib/plans/savePlan.functions";
import { getCapturedEmail, setCapturedEmail } from "@/lib/plans/session";
import { getLandingLinksForDestination, type LandingLink } from "@/lib/data/landingPages.functions";
import { PlanDeeper } from "@/components/guides/PlanDeeper";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { destinationCrumbs } from "@/lib/seo/breadcrumbs";
import { offerPhoto, type Photo } from "@/lib/data/destinationCardPhotos";
import { ROAD_PREPARATION_PARTNERS, preparationLink } from "@/lib/affiliates/travelpayouts";
import { commonsFilePage, parsePhotoCredit } from "@/lib/seo/imageCredit";

import { destinationSearchDescription, destinationSearchTitle } from "@/lib/seo/routeSeo";

export const Route = createFileRoute("/destinations/$slug/$region/$place/")({
  loader: async ({ params }): Promise<{ dest: DestinationView; landingLinks: LandingLink[]; locales: string[] }> => {
    const [dest, geo] = await Promise.all([
      getDestinationPageData({ data: { slug: params.place } }),
      getDestinationGeo({ data: { slug: params.place } }).catch(() => null),
    ]);
    if (!dest || !geo) throw notFound();
    // Wrong country/region in the address → permanent redirect to the right one.
    if (geo.country !== params.slug || geo.region !== params.region) {
      throw redirect({ href: `/destinations/${geo.country}/${geo.region}/${dest.slug}`, statusCode: 301 });
    }
    const landingLinks = await getLandingLinksForDestination({ data: { destinationId: dest.id } }).catch(() => []);
    const locales = await getDestinationLocales({ data: { slug: dest.slug } }).catch(() => []);
    return { dest, landingLinks, locales };
  },
  head: ({ loaderData }) => {
    const d = loaderData?.dest;
    if (!d) return { meta: [{ title: "Destination — WildParkRoutes" }] };
    const title = destinationSearchTitle(d.name);
    const description = travelDescription(d, "destination", destinationSearchDescription(d.name, d.tagline, d.bestSeason));
    const pageUrl = `${SITE_ORIGIN}${destinationPath(d.slug)}`;
    const jsonLd = buildDestinationJsonLd(d, pageUrl);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: d.heroImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: d.heroImage },
        // Thin pages (no tagline or hero yet) stay out of search indexes.
        ...(d.tagline && d.heroImage ? [] : [{ name: "robots", content: "noindex, follow" }]),
        { property: "og:url", content: pageUrl },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: pageUrl }, ...hreflangLinks(destinationPath(d.slug), ["en", ...(loaderData?.locales ?? []).filter(isLocale)])],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }],
    };
  },
  component: DestinationPage,
  notFoundComponent: DestinationNotFound,
});

function DestinationNotFound() {
  const { place: slug } = Route.useParams();
  return (
    <div className="bg-beige/30">
      <Header />
      <main className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-deep">
          Destination not found
        </p>
        <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
          We couldn't find "{slug}"
        </h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          That destination isn't in our guide yet — it may have been renamed, or the link might be
          off. Try searching again or explore our other destinations.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-off-white hover:bg-ink"
          >
            Explore destinations
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Report a broken link
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function DestinationPage() {
  const { dest, landingLinks } = Route.useLoaderData() as { dest: DestinationView; landingLinks: LandingLink[] };
  return <DestinationPageView dest={dest} landingLinks={landingLinks} />;
}
