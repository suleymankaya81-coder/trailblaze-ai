import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getDestinationGeo } from "@/lib/data/geo.functions";
import { parseLegacyGuidePath, guidePath, destinationPath } from "@/lib/routes/paths";

// Root-level single-segment addresses from the earlier structure:
// /zion-glamping → place guide, /zion → destination page (both 301).
// Static routes such as /about always win over this dynamic segment.
export const Route = createFileRoute("/$landing")({
  loader: async ({ params }) => {
    const slug = params.landing.toLowerCase();
    const lg = parseLegacyGuidePath(`/${slug}`);
    if (lg) throw redirect({ href: guidePath(lg.slug, lg.guide.segment), statusCode: 301 });
    if (/^[a-z0-9-]+$/.test(slug)) {
      const geo = await getDestinationGeo({ data: { slug } }).catch(() => null);
      if (geo) throw redirect({ href: `/destinations/${geo.country}/${geo.region}/${slug}`, statusCode: 301 });
      if (destinationPath(slug) !== `/destinations/${slug}`) throw redirect({ href: destinationPath(slug), statusCode: 301 });
    }
    throw notFound();
  },
  head: () => ({ meta: [{ title: "Page not found — WildParkRoutes" }, { name: "robots", content: "noindex" }] }),
  component: () => null,
  errorComponent: () => <p className="p-10 text-center">Something went wrong.</p>,
  notFoundComponent: LandingNotFound,
});

function LandingNotFound() {
  return (
    <div className="bg-beige/30">
      <Header />
      <main className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="font-display text-4xl text-foreground">Page not found</h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">This page doesn't exist. Explore our destinations instead.</p>
        <Link to="/destinations" className="mt-8 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-off-white">All destinations</Link>
      </main>
      <Footer />
    </div>
  );
}
