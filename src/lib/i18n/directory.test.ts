import { describe, expect, it } from "vitest";
import { selectTranslatedPlaces } from "./directory";

describe("French published-place directory", () => {
  it("shows 24 places per page without losing the final entries", () => {
    const rows = Array.from({ length: 50 }, (_, i) => ({ slug: `place-${i}`, name: `Place ${i}` }));
    expect(selectTranslatedPlaces(rows, "", "", 1).places).toHaveLength(24);
    const last = selectTranslatedPlaces(rows, "", "", 3);
    expect(last.places.map(p => p.slug)).toEqual(["place-48", "place-49"]);
    expect(last.total).toBe(50);
  });
  it("keeps country counts tied to supplied published translations", () => {
    const result = selectTranslatedPlaces([{ slug: "acadia", name: "Acadia" }], "us", "ACADIA", 1);
    expect(result.counts).toEqual({ us: 1 });
    expect(result.places[0]?.slug).toBe("acadia");
    expect(selectTranslatedPlaces([{ slug: "acadia", name: "Acadia" }], "fr", "", 1).total).toBe(0);
  });
});