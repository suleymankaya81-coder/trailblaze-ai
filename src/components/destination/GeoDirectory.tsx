import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageHero } from "@/components/site/PageHero";
import { PlaceCard } from "@/components/ui-kit";
import type { Crumb } from "@/lib/seo/breadcrumbs";
import { T } from "@/lib/i18n";

export type DirectoryItem = { to: string; title: string; image: string; summary?: string | null; info?: string | null };

/** Shared country and region directory: hero with breadcrumb trail and a grid of place cards. */
export function GeoDirectory({ kicker, title, intro, crumbs, heading, items, action, image }: {
  kicker: string; title: string; intro: string; crumbs: Crumb[]; heading: string; items: DirectoryItem[]; action: string; image?: string;
}) {
  return (
    <div className="bg-background">
      <Header />
      <PageHero kicker={<T>{kicker}</T>} title={title} intro={intro} crumbs={crumbs} image={image} />
      <main className="container-page py-10">
        <h2 className="mb-5 font-display text-2xl text-foreground"><T>{heading}</T></h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <PlaceCard key={it.to} to={it.to} image={it.image} alt={it.title} title={it.title} summary={it.summary} info={it.info} action={action} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
