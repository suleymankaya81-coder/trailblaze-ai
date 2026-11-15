import { describe, expect, it } from "vitest";
import { corridorPartnerLinks } from "./corridorPartners";

describe("country-aware RV links", () => {
  it("Canadian places link to Motorhome Republic's Canada search, not the US Black Friday page", () => {
    const url = corridorPartnerLinks("banff-national-park").motorhome;
    expect(url).toContain("/canada/");
    expect(url).not.toContain("black-friday");
  });
});
