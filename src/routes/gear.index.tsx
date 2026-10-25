import { createFileRoute } from "@tanstack/react-router";
import { GearShopPage } from "@/components/gear/GearShopPage";
import { wildguarderProducts } from "@/lib/data/gearCategories";
import { HUB_SEO } from "@/lib/seo/hubSeo";

const title = HUB_SEO.gear.title;
const description = HUB_SEO.gear.description;

export const Route = createFileRoute("/gear/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://minialife.com/gear" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://minialife.com/gear" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "WILDGUARDER Night Vision Spotlight",
          itemListElement: wildguarderProducts.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `WILDGUARDER ${p.name}`,
            url: p.url,
          })),
        }).replace(/</g, "\\u003c"),
      },
    ],
  }),
  component: GearShopPage,
});
