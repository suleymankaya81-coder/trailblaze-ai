import { createFileRoute } from "@tanstack/react-router";
import { GearShopPage } from "@/components/gear/GearShopPage";
import { shopPicks } from "@/lib/data/gearShop";

const title = "Gear Shop: Bikepacking & Cycling Picks | MiniaLife";
const description =
  "Handpicked ROCKBROS bikepacking bags, lights and cycling accessories with catalog prices, plus buying guides for your next outdoor adventure.";

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
          name: "Popular Gear Picks",
          itemListElement: shopPicks.map(({ product }, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `ROCKBROS ${product.name}`,
            url: product.productUrl,
          })),
        }).replace(/</g, "\\u003c"),
      },
    ],
  }),
  component: GearShopPage,
});
