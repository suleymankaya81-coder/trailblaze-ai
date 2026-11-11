import { createFileRoute, notFound, useLoaderData } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { TripBuilder } from "@/components/trip-builder/TripBuilder";
import { getDestinationPageData } from "@/lib/data/destinations.functions";
import { T } from "@/lib/i18n";
import { Link } from "@/components/site/LocalLink";

async function loadBuilder({ params }: { params: { slug: string } }) {
  const dest = await getDestinationPageData({ data: { slug: params.slug } });
  if (!dest?.travelPlan) throw notFound();
  return { slug: dest.slug, name: dest.name, region: dest.region, plan: dest.travelPlan };
}

export const Route = createFileRoute("/trip-builder/$slug")({
  loader: loadBuilder,
  // Personal tool: never indexed; canonical points at the destination guide.
  head: ({ loaderData, params }) => {
    const name = loaderData?.name ?? "your trip";
    const title = `Customize your ${name} road trip — MiniaLife`;
    const description = `Reorder stops, change days and get Google Maps and GPX routes plus campsite links for ${name}.`;
    return {
      meta: [
        { title }, { name: "description", content: description }, { name: "robots", content: "noindex, follow" },
        { property: "og:title", content: title }, { property: "og:description", content: description },
        { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: `https://minialife.com/destinations/${params.slug}` }],
    };
  },
  component: BuilderPage,
  notFoundComponent: () => <div className="container-page py-20"><T>No editable trip plan for this place yet.</T></div>,
});

export function BuilderPage() {
  const d = useLoaderData({ strict: false }) as Awaited<ReturnType<typeof loadBuilder>>;
  return <div className="min-h-screen bg-background">
    <Header />
    <main className="container-page py-8 md:py-12">
      <Link to="/destinations/$slug" params={{ slug: d.slug }} className="text-sm text-primary underline underline-offset-4">← <T>Back to</T> <T>{d.name}</T></Link>
      <h1 className="mt-3 font-display text-3xl text-foreground md:text-4xl"><T>Customize your trip</T>: <T>{d.name}</T></h1>
      <p className="mt-2 mb-8 max-w-2xl text-sm text-muted-foreground"><T>Reorder stops, move them between days, and open each day in Google Maps. Booking links update with your overnight stop.</T></p>
      <TripBuilder slug={d.slug} name={d.name} region={d.region} plan={d.plan} />
    </main>
    <Footer />
  </div>;
}
