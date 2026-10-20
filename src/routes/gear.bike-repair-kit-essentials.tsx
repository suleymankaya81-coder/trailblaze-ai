import { createFileRoute } from "@tanstack/react-router";
import { GearGuide } from "@/components/gear/GearGuide";
import { gearGuides } from "@/lib/data/gearGuides";

const c = gearGuides.repair;
const url = `https://minialife.com${c.path}`;

export const Route = createFileRoute("/gear/bike-repair-kit-essentials")({
  head: () => ({
    meta: [
      { title: c.metaTitle },
      { name: "description", content: c.description },
      { property: "og:title", content: c.metaTitle },
      { property: "og:description", content: c.description },
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
