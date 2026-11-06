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
      ["en", "https://minialife.com/destinations/zion"],
      ["de", "https://minialife.com/de/destinations/zion"],
      ["x-default", "https://minialife.com/destinations/zion"],
    ]);
  });
});
