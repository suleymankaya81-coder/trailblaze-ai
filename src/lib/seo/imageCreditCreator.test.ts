import { describe, expect, it } from "vitest";
import type { DestinationView } from "@/lib/data/destinations.functions";
import { creditCreatorEntity, creditName } from "./imageCredit";
import { buildDestinationJsonLd } from "./destinationJsonLd";

describe("photo credit creators", () => {
  it("never emits a park's own photo account as a Person", () => {
    expect(creditCreatorEntity("Zion National Park", "Zion National Park")).toEqual({ "@type": "Organization", name: "Zion National Park" });
    expect(creditCreatorEntity("NPS Photo")).toEqual({ "@type": "Organization", name: "NPS Photo" });
    expect(creditCreatorEntity("Yellowstone", "Yellowstone")).toEqual({ "@type": "Organization", name: "Yellowstone" });
  });
  it("omits the creator for text that is not a name", () => {
    for (const t of ["Unknown authorUnknown author", "Trabalho meu, arquivo pessoal", "Own work", "Anonymous", "—", "12345"]) expect(creditCreatorEntity(t)).toBeNull();
  });
  it("keeps individual photographers and uploaders as Person, in any script", () => {
    expect(creditCreatorEntity("Bill Golladay")).toEqual({ "@type": "Person", name: "Bill Golladay" });
    expect(creditCreatorEntity("Αλεξανδρής Αλέξης")).toEqual({ "@type": "Person", name: "Αλεξανδρής Αλέξης" });
    expect(creditCreatorEntity("Ji-Hoon Park")).toEqual({ "@type": "Person", name: "Ji-Hoon Park" });
  });
  it("extracts the name from Commons and Flickr wrappers", () => {
    expect(creditName("The original uploader was Marc Mongenet at French Wikipedia.")).toBe("Marc Mongenet");
    expect(creditName("User:Wikid77")).toBe("Wikid77");
    expect(creditName("Miguel Vieira from Redwood City, CA, USA")).toBe("Miguel Vieira");
    expect(creditName("(vincent desjardins) from Paris, France")).toBe("vincent desjardins");
  });
  it("destination JSON-LD: Zion's own photo credit is not a Person, but stays credited", () => {
    const dest = { name: "Zion National Park", slug: "zion", region: "Utah", tagline: "t", travelPlan: null,
      heroImage: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Zion.jpg",
      gallery: ["https://upload.wikimedia.org/wikipedia/commons/c/cd/Angels.jpg"],
      photoCredit: "Hero: Bill Golladay / CC BY-SA 4.0 via Wikimedia Commons · Gallery: Zion National Park / CC BY 2.0 via Wikimedia Commons" } as unknown as DestinationView;
    const s = JSON.stringify(buildDestinationJsonLd(dest, "https://wildparkroutes.com/destinations/us/utah/zion"));
    expect(s).toContain('{"@type":"Person","name":"Bill Golladay"}');
    expect(s).not.toContain('{"@type":"Person","name":"Zion National Park"}');
    expect(s).toContain('"creditText":"Zion National Park / CC BY 2.0 via Wikimedia Commons"');
  });
});
