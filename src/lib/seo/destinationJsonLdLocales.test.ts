import { describe, expect, it } from "vitest";
import type { DestinationView } from "@/lib/data/destinations.functions";
import { buildDestinationJsonLd } from "./destinationJsonLd";
import { visibleAnswerFaqs } from "./visibleAnswers";

// `dest` as the German page has it after translateDest (stored translation overlaid).
const deDest = {
  name: "Yellowstone-Nationalpark", slug: "yellowstone", region: "Wyoming", tagline: "Geysire, Bisonherden und ein alpines Wunderland.",
  heroImage: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Y.jpg", lat: 44.6, lng: -110.5,
  travelPlan: { days: [{ title: "Geysirbecken", stops: [{ name: "Old Faithful", detail: "Den Geysir von den Holzstegen aus ansehen." }] }] },
} as unknown as DestinationView;
const url = "https://wildparkroutes.com/de/destinations/us/wyoming/yellowstone";
const crumbs = [{ name: "Startseite", path: "/de" }, { name: "Reiseziele", path: "/de/destinations" }, { name: "Yellowstone-Nationalpark", path: "/de/destinations/us/wyoming/yellowstone" }];
type Node = Record<string, unknown> & { "@type": string };
const nodes = (o: unknown): Node[] => (o && typeof o === "object" ? [...(("@type" in (o as object)) ? [o as Node] : []), ...Object.values(o as object).flatMap(nodes)] : []);

describe("translated place pages get the English JSON-LD types", () => {
  const ld = buildDestinationJsonLd(deDest, url, visibleAnswerFaqs("yellowstone", "de"), { locale: "de", crumbs });
  const all = nodes(ld);
  const types = new Set(all.map((n) => n["@type"]));
  it("has TouristDestination, WebPage, TouristTrip/TouristAttraction, BreadcrumbList and FAQPage", () => {
    for (const t of ["TouristDestination", "WebPage", "TouristTrip", "TouristAttraction", "BreadcrumbList", "FAQPage"]) expect(types.has(t)).toBe(true);
  });
  it("uses the translated fields and the German page URL", () => {
    const d = all.find((n) => n["@type"] === "TouristDestination")!;
    expect(d).toMatchObject({ "@id": `${url}#destination`, name: "Yellowstone-Nationalpark", description: deDest.tagline, url });
    expect(all.find((n) => n["@type"] === "WebPage")).toMatchObject({ inLanguage: "de", name: "Yellowstone-Nationalpark: Reiseführer" });
    expect(JSON.stringify(ld)).toContain('"name":"Tag 1: Geysirbecken"');
    expect(JSON.stringify(ld)).toContain("— Landschaft");
  });
  it("uses the localized breadcrumb trail", () => {
    const b = all.find((n) => n["@type"] === "BreadcrumbList") as unknown as { itemListElement: { name: string; item: string }[] };
    expect(b.itemListElement.map((i) => i.name)).toEqual(["Startseite", "Reiseziele", "Yellowstone-Nationalpark"]);
    expect(b.itemListElement[2].item).toBe(url);
  });
  it("FAQPage mirrors the questions as shown on the German page", () => {
    const f = all.find((n) => n["@type"] === "FAQPage") as unknown as { mainEntity: { name: string }[] };
    expect(f.mainEntity[0].name).toBe("Wie viele Tage sollte ich im Yellowstone verbringen?");
  });
  it("French wording", () => {
    const fr = JSON.stringify(buildDestinationJsonLd(deDest, url.replace("/de/", "/fr/"), [], { locale: "fr" }));
    expect(fr).toContain('"inLanguage":"fr"');
    expect(fr).toContain("en 1 jour\"");
  });
  it("English output is unchanged by default", () => {
    const en = buildDestinationJsonLd(deDest, url);
    expect(JSON.stringify(en)).toContain('"inLanguage":"en"');
    expect(JSON.stringify(en)).toContain('"name":"Day 1: Geysirbecken"');
  });
});
