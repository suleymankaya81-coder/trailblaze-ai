import { describe, expect, it } from "vitest";
import { airportCity, flyDriveFaqs, flyDriveSlug, parseFlyDriveSlug } from "./flyDrive";

const ys = { slug: "yellowstone", name: "Yellowstone", airportCode: "BZN", airportName: "Bozeman Yellowstone International Airport", driveMinutes: 116, driveMiles: 90 };

describe("fly & drive slugs", () => {
  it("builds the agreed URL shape", () => {
    expect(flyDriveSlug(ys)).toBe("bozeman-bzn-yellowstone");
  });
  it("round-trips multi-word destination slugs", () => {
    expect(parseFlyDriveSlug("st-sgu-grand-canyon")).toEqual({ iata: "sgu", destinationSlug: "grand-canyon" });
    expect(parseFlyDriveSlug("bozeman-bzn-yellowstone")).toEqual({ iata: "bzn", destinationSlug: "yellowstone" });
  });
  it("prefers a parenthetical city", () => {
    expect(airportCity("McGhee Tyson Airport (Knoxville)")).toBe("knoxville");
    expect(airportCity("St. George Regional Airport")).toBe("st-george");
    expect(parseFlyDriveSlug("st-george-sgu-zion")).toEqual({ iata: "sgu", destinationSlug: "zion" });
  });
  it("returns null when drive time or airport is missing", () => {
    expect(flyDriveSlug({ ...ys, driveMinutes: null })).toBeNull();
    expect(flyDriveSlug({ ...ys, airportCode: null })).toBeNull();
    expect(flyDriveFaqs({ ...ys, driveMinutes: null, permitHeadline: null, permitLevel: null })).toEqual([]);
  });
});
