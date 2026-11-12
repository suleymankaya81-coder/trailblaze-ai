import { describe, expect, it } from "vitest";
import { t, localeFromPath, localizePath, stripLocale } from "./index";
import { hreflangLinks } from "@/lib/seo/hreflang";

describe("i18n", () => {
  it("falls back to English for missing German keys", () => {
    expect(t("de", "nav.destinations")).toBe("Reiseziele");
    expect(t("de", "plan.day")).toBe("Tag");
  });
  it("maps paths between languages", () => {
    expect(localeFromPath("/de/destinations/zion")).toBe("de");
    expect(localeFromPath("/destinations")).toBe("en");
    expect(localeFromPath("/denali-guide")).toBe("en");
    expect(localizePath("/", "de")).toBe("/de");
    expect(localizePath("/destinations/zion", "en")).toBe("/destinations/zion");
    expect(stripLocale("/de")).toBe("/");
    expect(stripLocale("/de/road-trips")).toBe("/road-trips");
  });
  it("emits hreflang only when a German version exists", () => {
    expect(hreflangLinks("/destinations/zion", ["en"])).toEqual([]);
    const links = hreflangLinks("/destinations/zion", ["en", "de"]);
    expect(links.map((l) => [l.hrefLang, l.href])).toEqual([
      ["en", "https://wildparkroutes.com/destinations/zion"],
      ["de", "https://wildparkroutes.com/de/destinations/zion"],
      ["x-default", "https://wildparkroutes.com/destinations/zion"],
    ]);
  });
});

import { tp } from "./index";
describe("phrase translation", () => {
  it("translates fixed and patterned phrases for German", () => {
    expect(tp("de", "See places to stay")).toBe("Unterkünfte ansehen");
    expect(tp("de", "Find flights to CNY")).toBe("Flüge nach CNY finden");
    expect(tp("de", "Est. from $45/day")).toBe("Ca. ab 45 $/Tag");
  });
  it("leaves English and unknown text unchanged", () => {
    expect(tp("en", "See places to stay")).toBe("See places to stay");
    expect(tp("de", "Arches National Park")).toBe("Arches National Park");
  });
});

describe("combined phrases", () => {
  it("translates each part around a middle dot", () => {
    expect(tp("de", "Est. from $35/night · estimate")).toBe("Ca. ab 35 $/Nacht · Schätzung");
  });
});
