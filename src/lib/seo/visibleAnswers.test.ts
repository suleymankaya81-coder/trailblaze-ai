import { describe, expect, it } from "vitest";
import { destinationAnswers } from "@/lib/data/destinationAnswers";
import { buildDestinationJsonLd } from "./destinationJsonLd";
import { visibleAnswerFaqs, visibleDestinationAnswers } from "./visibleAnswers";
import type { DestinationView } from "@/lib/data/destinations.functions";

const dest = { name: "Yellowstone", slug: "yellowstone", region: "Wyoming", tagline: "Geysers", heroImage: "https://example.org/y.jpg", travelPlan: null } as unknown as DestinationView;
const url = "https://wildparkroutes.com/destinations/us/wyoming/yellowstone";
type Node = Record<string, unknown> & { "@type"?: string };
const graph = (d: DestinationView) => (buildDestinationJsonLd(d, url, visibleAnswerFaqs(d.slug))["@graph"] as Node[]);

describe("destination FAQPage", () => {
  it("marks up exactly the visible reviewed answers", () => {
    const faq = graph(dest).find((n) => n["@type"] === "FAQPage") as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    const shown = visibleDestinationAnswers("yellowstone")!.items;
    expect(faq.mainEntity).toHaveLength(destinationAnswers.yellowstone.answers.length);
    expect(faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text])).toEqual(shown.map((x) => [x.q, x.a]));
    expect(faq.mainEntity[0].name).toBe("How many days should I spend in Yellowstone?");
  });
  it("emits no FAQPage for a place without visible answers", () => {
    const other = { ...dest, slug: "acadia", name: "Acadia" } as DestinationView;
    expect(visibleAnswerFaqs("acadia")).toEqual([]);
    expect(graph(other).some((n) => n["@type"] === "FAQPage")).toBe(false);
  });
  it("never adds the hidden source URL or review date to the answer text", () => {
    for (const f of visibleAnswerFaqs("grand-canyon")) {
      expect(f.a).not.toContain("https://");
      expect(f.a).not.toContain("2026-10-17");
    }
  });
});
