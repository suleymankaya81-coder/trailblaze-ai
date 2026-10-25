import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronRight, ExternalLink } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getShopCategory } from "@/lib/data/gearShop.functions";
import { isShopCategory, shopCategoryMeta } from "@/lib/data/gearShop.categories";

export const Route = createFileRoute("/gear/category/$key")({
  loader: async ({ params }) => {
    if (!isShopCategory(params.key)) throw notFound();
    const file = await getShopCategory({ data: { key: params.key } });
    if (!file || !file.items.length) throw notFound();
    return file;
  },
  head: ({ params, loaderData }) => {
    const meta = isShopCategory(params.key) ? shopCategoryMeta[params.key] : null;
    if (!meta || !loaderData) return { meta: [{ title: "Gear category — MiniaLife" }, { name: "robots", content: "noindex" }] };
    const url = `https://minialife.com/gear/category/${params.key}`;
    const title = `${meta.label} — ROCKBROS Trip Essentials | MiniaLife`;
    return {
      meta: [
        { title },
        { name: "description", content: meta.intro },
        { property: "og:title", content: title },
        { property: "og:description", content: meta.intro },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: meta.label,
          numberOfItems: loaderData.items.length,
          itemListElement: loaderData.items.slice(0, 24).map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name })),
        }).replace(/</g, "\\u003c"),
      }],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl font-semibold">Category not found</h1>
      <Link to="/gear" className="mt-4 inline-block text-forest underline">Back to Gear Shop</Link>
    </div>
  ),
  errorComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl font-semibold">Products could not load</h1>
      <Link to="/gear" className="mt-4 inline-block text-forest underline">Back to Gear Shop</Link>
    </div>
  ),
});

type Sort = "featured" | "low" | "high";
const usd = (n: number) => `$${n.toFixed(2)}`;

function CategoryPage() {
  const file = Route.useLoaderData();
  const { key } = Route.useParams();
  const meta = shopCategoryMeta[key as keyof typeof shopCategoryMeta];
  const [sort, setSort] = useState<Sort>("featured");
  const [shown, setShown] = useState(24);
  const items = useMemo(() => {
    const list = [...file.items];
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    return list;
  }, [file.items, sort]);
  const reviewed = new Date(file.reviewed).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-page py-10">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/gear" className="hover:underline">Gear Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{meta.label}</span>
        </nav>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-sky/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-sky">Curated Trip Essentials · ROCKBROS</span>
            <h1 className="mt-3 font-display text-3xl font-semibold text-foreground md:text-4xl">{meta.label}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{meta.intro}</p>
            <p className="mt-1 text-xs text-muted-foreground">{file.items.length.toLocaleString("en-US")} in-stock products · Prices as of {reviewed}, may change</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Sort
            <select value={sort} onChange={(e) => { setSort(e.target.value as Sort); setShown(24); }} className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground">
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </label>
        </div>

        {meta.guides.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {meta.guides.map((g) => (
              <a key={g.to} href={g.to} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-forest hover:shadow-soft">
                Buying guide: {g.label} <ArrowRight className="h-3 w-3" />
              </a>
            ))}
          </div>
        )}

        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {items.slice(0, shown).map((p) => (
            <li key={p.id}>
              <a href={p.url} target="_blank" rel="sponsored nofollow noopener" className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition hover:shadow-lift">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img src={p.image} alt={p.name} loading="lazy" width={600} height={600} className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105" />
                  {p.listPrice && <span className="absolute left-2 top-2 rounded-full bg-clay px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">Sale</span>}
                </div>
                <div className="flex flex-1 flex-col p-3 md:p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">ROCKBROS · In stock</span>
                  <h2 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">{p.name}</h2>
                  <p className="mt-2 text-base font-bold text-foreground">
                    {usd(p.price)} {p.listPrice && <span className="ml-1 text-xs font-normal text-muted-foreground line-through">{usd(p.listPrice)}</span>}
                  </p>
                  <span className="mt-auto pt-3">
                    <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground group-hover:bg-primary/90">
                      Shop at ROCKBROS <ExternalLink className="h-3 w-3" />
                    </span>
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>

        {shown < items.length && (
          <div className="mt-8 text-center">
            <button onClick={() => setShown((n) => n + 24)} className="rounded-md border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground hover:shadow-soft">
              Show more ({items.length - shown} left)
            </button>
          </div>
        )}

        <p className="mt-12 rounded-xl bg-muted/60 p-4 text-xs text-muted-foreground">
          Products, photos and prices come from the ROCKBROS catalog ({reviewed}) and may change; checkout happens on the ROCKBROS store. We have not hands-on tested every item.
        </p>
      </main>
      <Footer />
    </div>
  );
}
