import { describe, expect, it } from "vitest";
import library from "@/data/servicePhotos.json";
import { offerPhoto } from "./destinationCardPhotos";
import { serviceCategory, servicePhoto } from "./servicePhotos";

describe("service photo matching", () => {
  it("distinguishes cars, campervans and bicycles", () => {
    expect(serviceCategory("Car rentals at JAC", "rental")).toBe("car");
    expect(serviceCategory("Sprinter Adventure Van", "rental")).toBe("campervan");
    expect(serviceCategory("Mountain Bike Day Rental", "rental")).toBe("bike");
  });
  it("chooses by service even when a car is the first rental", () => {
    const photo = offerPhoto("grand-teton", "rental", 0, "Car rentals at JAC");
    expect(library.car.map((p) => p.url)).toContain(photo?.url);
  });
  it("uses cabins rather than landscapes for cabin stays", () => {
    const photo = offerPhoto("yosemite", "stay", 0, "Whole-home cabin");
    expect(library.cabin.map((p) => p.url)).toContain(photo?.url);
  });
  it("varies photos between destinations and adjacent same-service cards", () => {
    const choices = ["acadia", "yosemite", "moab", "grand-teton", "glacier"].map((slug) => servicePhoto("car", slug)?.url);
    expect(new Set(choices).size).toBeGreaterThan(1);
    expect(servicePhoto("car", "yosemite", 0)?.url).not.toBe(servicePhoto("car", "yosemite", 1)?.url);
  });
  it("never falls back to a different destination's activity photo", () => {
    expect(offerPhoto("unknown-place", "activity", 0)).toBeUndefined();
  });
});
import { estimatedFrom } from "./servicePhotos";
describe("estimatedFrom", () => {
  it("campground estimate", () => expect(estimatedFrom("Riverside campground")).toBe("Est. from $35/night"));
  it("cabin estimate", () => expect(estimatedFrom("Lakeside cabin")).toBe("Est. from $120/night"));
  it("RV estimate", () => expect(estimatedFrom("Class C RV")).toBe("Est. from $150/day"));
});
