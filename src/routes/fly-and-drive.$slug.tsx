import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BookingStepsStrip } from "@/components/guides/BookingStepsStrip";
import { ViatorPlaceBlock } from "@/components/destination/ViatorPlaceBlock";
import { ArrivalPlan, BeforeYouLand, FlyDriveFaq, FlyDriveHero, RelatedLinks, RouteCard } from "@/components/flydrive/FlyDriveSections";
import { getDestinationPageData } from "@/lib/data/destinations.functions";
import { getAirportSiblings } from "@/lib/data/flyDrive.functions";
import { SITE, flyDriveFaqs, flyDriveJsonLd, flyDriveSlug, formatDriveShort, parseFlyDriveSlug } from "@/lib/seo/flyDrive";

export const Route = createFileRoute("/fly-and-drive/$slug")({
  loader: async ({ params }) => {
    const parsed = parseFlyDriveSlug(params.slug);
    if (!parsed) throw notFound();
    const dest = await getDestinationPageData({ data: { slug: parsed.destinationSlug } }).catch(() => null);
    if (!dest) throw notFound();
    const canonical = flyDriveSlug(dest);
    if (!canonical || !dest.airportCode || dest.driveMinutes == null) throw notFound();
    if (canonical !== params.slug) throw redirect({ to: "/fly-and-drive/$slug", params: { slug: canonical }, statusCode: 301 });
    const siblings = await getAirportSiblings({ data: { airport: dest.airportCode, exclude: dest.slug } });
    return { dest, driveMinutes: dest.driveMinutes, siblings, faqs: flyDriveFaqs(dest), url: `${SITE}/fly-and-drive/${canonical}` };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Unavailable — MiniaLife" }, { name: "robots", content: "noindex" }] };
    const { dest, driveMinutes, faqs, url } = loaderData;
    const title = `Fly into ${dest.airportCode}, Drive to ${dest.name} — MiniaLife`;
    const description = `Flights to ${dest.airportCode}, airport car rental, luggage storage and a first night near ${dest.name}. ${formatDriveShort(driveMinutes)} drive, reservation notes included.`;
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
      scripts: [{ type: "application/ld+json", children: JSON.stringify(flyDriveJsonLd({ ...dest, faqs }, url)).replace(/</g, "\\u003c") }],
    };
  },
  component: FlyDrivePage,
  errorComponent: () => <div className="container-page py-20">This guide could not load. Please try again.</div>,
  notFoundComponent: () => <div className="container-page py-20">This fly & drive guide does not exist yet.</div>,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="container-page py-10 md:py-14">
      <h2 className="mb-6 font-display text-2xl font-bold text-foreground md:text-3xl">{title}</h2>
      {children}
    </section>
  );
}

function FlyDrivePage() {
  const { dest, siblings, faqs } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <FlyDriveHero dest={dest} />
        <section className="container-page -mt-10 relative">
          <RouteCard dest={dest} />
          <div className="mt-6"><BookingStepsStrip slug={dest.slug} name={dest.name} airportCode={dest.airportCode} /></div>
        </section>
        <Section title="Your arrival plan">
          <ArrivalPlan dest={dest} />
        </Section>
        <Section title="Before you land">
          <BeforeYouLand dest={dest} />
        </Section>
        <section className="container-page pb-6"><ViatorPlaceBlock slug={dest.slug} name={dest.name} /></section>
        <Section title="Quick answers">
          <FlyDriveFaq faqs={faqs} />
        </Section>
        <Section title="Keep planning">
          <RelatedLinks dest={dest} siblings={siblings} />
        </Section>
      </main>
      <Footer />
    </div>
  );
}
