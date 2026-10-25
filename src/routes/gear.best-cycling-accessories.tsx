import { createFileRoute } from "@tanstack/react-router";
import { GearGuide } from "@/components/gear/GearGuide";
import { gearGuides } from "@/lib/data/gearGuides";
import { GEAR_ARTICLE_SEO } from "@/lib/seo/gearSeo";

const c = gearGuides.accessories;
const seo = GEAR_ARTICLE_SEO.accessories;
const url = `https://minialife.com${c.path}`;

export const Route = createFileRoute("/gear/best-cycling-accessories")({
  head: () => ({
    meta: [
      { title: seo.title },
      { name: "description", content: seo.description },
      { property: "og:title", content: seo.title },
      { property: "og:description", content: seo.description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: url },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: c.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }).replace(/</g, "\\u003c"),
      },
    ],
  }),
  component: () => <GearGuide config={c} />,
});
