import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dayNudge } from "./TravelFlow";
import { tp } from "@/lib/i18n";

describe("destination layout", () => {
  it("shows the vehicle & tour showcase before the itinerary", () => {
    const src = readFileSync("src/components/destination/DestinationPageView.tsx", "utf8");
    const page = src.slice(src.indexOf("<BookingBar />"));
    expect(page.indexOf("<TopShowcase")).toBeGreaterThan(-1);
    expect(page.indexOf("<TopShowcase")).toBeLessThan(page.indexOf("<TravelFlow"));
    expect(page.indexOf("<LocalIntel")).toBeLessThan(page.indexOf("<TravelFlow"));
  });
  it("day 1 links to vehicles, day 2 to tours, last day to stays", () => {
    expect(dayNudge(0, 3, "BZN")?.href).toBe("#trip-vehicles");
    expect(dayNudge(1, 3)?.href).toBe("#trip-tours");
    expect(dayNudge(2, 3)?.href).toBe("#stays");
  });
  it("translates the showcase heading for German visitors", () => {
    expect(tp("de", "Pick up at BZN airport")).toBe("Abholung am Flughafen BZN");
  });
});
