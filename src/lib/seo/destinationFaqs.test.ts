import { describe, expect, it } from "vitest";

import { destinationFaqs } from "./guides";
import { buildDestinationJsonLd } from "./destinationJsonLd";
import type { DestinationView } from "@/lib/data/destinations.functions";

const base = {
  slug: "test-place",
  name: "Test Place",
  airportCode: "TST",
  airportName: "Test Place International",
  driveMinutes: 150,
  permitLevel: "high" as const,
  permitNote: "Timed entry is required in peak season.",
  permitHeadline: null,
  campingScore: null,
  bestSeason: "June – September",
  tagline: "A test place",
  tripDurationDays: "3–5 days",
  avgDailyBudget: 180,
};

describe("destinationFaqs", () => {
  it("answers the searched question shapes when data exists", () => {
    const faqs = destinationFaqs(base);
    expect(faqs.map((f) => f.q)).toEqual([
      "When is the best time to visit Test Place?",
      "What is the closest airport to Test Place?",
      "How many days do you need in Test Place?",
      "Do you need a reservation for Test Place?",
      "How much does a trip to Test Place cost?",
    ]);
  });

  it("formats the airport drive time", () => {
    const faqs = destinationFaqs(base);
    expect(faqs[1].a).toBe("Test Place International (TST) is the closest airport, about 2 h 30 min away by car, without stops.");
  });

  it("skips a question when its data is missing", () => {
    expect(destinationFaqs({ ...base, bestSeason: null }).map((f) => f.q)).not.toContain("When is the best time to visit Test Place?");
    expect(destinationFaqs({ ...base, airportCode: null }).map((f) => f.q)).not.toContain("What is the closest airport to Test Place?");
    expect(destinationFaqs({ ...base, tripDurationDays: null }).map((f) => f.q)).not.toContain("How many days do you need in Test Place?");
    expect(destinationFaqs({ ...base, permitLevel: null, permitNote: null }).map((f) => f.q)).not.toContain("Do you need a reservation for Test Place?");
    expect(destinationFaqs({ ...base, avgDailyBudget: null }).map((f) => f.q)).not.toContain("How much does a trip to Test Place cost?");
  });

  it("labels the budget answer as a typical estimate", () => {
    const cost = destinationFaqs(base).find((f) => f.q.startsWith("How much"))!;
    expect(cost.a).toContain("$180 per person");
    expect(cost.a).toContain("typical estimate");
  });

  it("returns nothing for a bare destination", () => {
    expect(destinationFaqs({ slug: "bare", name: "Bare", airportCode: null, airportName: null, driveMinutes: null, permitLevel: null, permitNote: null, permitHeadline: null, campingScore: null, bestSeason: null })).toEqual([]);
  });

  it("prefers reviewed Yellowstone answers and notes over generated text", () => {
    const faqs = destinationFaqs({ ...base, slug: "yellowstone", name: "Yellowstone" });
    const days = faqs.find((f) => f.q.startsWith("How many days"))!;
    expect(days.a).toContain("three days");
    expect(days.a).toContain("planning suggestion");
    const reservation = faqs.find((f) => f.q.startsWith("Do you need a reservation"))!;
    expect(reservation.a).toContain("does not require a vehicle entry reservation");
    expect(reservation.a).not.toBe("Timed entry is required in peak season.");
  });
});

describe("buildDestinationJsonLd FAQs", () => {
  const dest = { ...base, region: "Test Region", heroImage: "", gallery: [], photoCredit: null, aliases: [], scenicScore: null, avgDailyBudget: 180, tripDurationDays: "3–5 days", id: "x", permitSourceUrl: null, travelPlan: null, airportLat: null, airportLng: null, lat: null, lng: null, driveMiles: null, stays: [], rentals: [], activities: [], essentials: [], globalServices: [], similar: [] } as unknown as DestinationView;

  it("mirrors the visible FAQs as FAQPage", () => {
    const faqs = destinationFaqs(base);
    const ld = buildDestinationJsonLd(dest, "https://minialife.com/destinations/test-place", faqs) as { "@graph": Record<string, unknown>[] };
    const faqPage = ld["@graph"].find((n) => n["@type"] === "FAQPage") as { mainEntity: { name: string }[] };
    expect(faqPage.mainEntity.map((e) => e.name)).toEqual(faqs.map((f) => f.q));
  });

  it("omits FAQPage when there are no answers", () => {
    const ld = buildDestinationJsonLd(dest, "https://minialife.com/destinations/test-place", []) as { "@graph": Record<string, unknown>[] };
    expect(ld["@graph"].some((n) => n["@type"] === "FAQPage")).toBe(false);
  });
});
