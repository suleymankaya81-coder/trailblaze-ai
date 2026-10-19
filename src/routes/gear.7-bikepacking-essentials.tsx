import { createFileRoute } from "@tanstack/react-router";
import { BikepackingGuide } from "@/components/gear/BikepackingGuide";
import { gearFaqs } from "@/lib/data/rockbrosGear";

const title = "7 Bikepacking Essentials from ROCKBROS | MiniaLife";
const description = "Compare seven ROCKBROS bikepacking picks: bags, a front light, a bottle cage and a camping pump, with catalog prices and practical fit notes.";
export const Route = createFileRoute("/gear/7-bikepacking-essentials")({
  head: () => ({
    meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary_large_image" }, { property: "og:url", content: "https://minialife.com/gear/7-bikepacking-essentials" }],
    links: [{ rel: "canonical", href: "https://minialife.com/gear/7-bikepacking-essentials" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: gearFaqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }).replace(/</g, "\\u003c") }],
  }),
  component: BikepackingGuide,
});
