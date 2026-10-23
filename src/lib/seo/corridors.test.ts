import { describe, expect, it } from "vitest";
import { CORRIDORS } from "./corridors";
import { corridorPartnerLinks } from "@/lib/affiliates/corridorPartners";

describe("gateway corridors", () => {
  it("has six indexable loops with unique slugs", () => {
    const live = CORRIDORS.filter((c) => !c.pilot);
    expect(live.length).toBe(6);
    expect(new Set(live.map((c) => c.slug)).size).toBe(6);
  });
  it.each(CORRIDORS.map((c) => [c.slug, c] as const))("%s has content and 3 experiences", (_s, c) => {
    expect(c.stops.length).toBeGreaterThanOrEqual(3);
    expect(c.essentials.length).toBe(6);
    expect(c.faqs.length).toBe(3);
    expect(c.experiences.length).toBe(3);
    expect(new URL(corridorPartnerLinks(c.slug).flight).searchParams.get("sub_id")).toBe(c.slug);
  });
});
