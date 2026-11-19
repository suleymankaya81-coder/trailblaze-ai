import { expect, it } from "vitest";
import { translatedCountryPlaces } from "./translatedCountry";

it("excludes untranslated parks from German country links", () => {
  const places = [
    { slug: "translated-park", name: "Translated", region: "north", lat: 60, lng: 10, access: "road" },
    { slug: "english-only-park", name: "English only", region: "south", lat: 59, lng: 11, access: "road" },
  ];
  expect(translatedCountryPlaces(places, ["translated-park"]).map(p => p.slug)).toEqual(["translated-park"]);
  expect(translatedCountryPlaces(places, [])).toEqual([]);
});