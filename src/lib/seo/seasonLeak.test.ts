// Fails if stored "no verified season" / "check official seasonal information" text can reach rendered
// output, titles, meta or JSON-LD. Real stored strings (sample.json translations, combined-content caches).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", async (orig) => ({
  ...(await orig<typeof import("@tanstack/react-router")>()),
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => unknown }) => select({ location: { pathname: (globalThis as { __path?: string }).__path ?? "/" } }),
}));

import { STORED_UNKNOWN_FACT, genuineSeason, isSeasonText } from "./season";
import { travelDescription } from "./travelMetadata";
import { destinationSearchDescription } from "./routeSeo";
import { destinationShortAnswer } from "./destinationAnswer";
import { destinationFaqs, destGuideJsonLd } from "./guides";
import { landingFaqs } from "./landingFaqs";
import { pinDescription, pinTitle } from "./pinCopy";
import { buildDestinationJsonLd } from "./destinationJsonLd";
import { translateDest } from "@/lib/i18n/translateDest";
import { permitFallback } from "@/components/destination/TripRadar";
import { factItems } from "@/components/landing/DecisionBlocks";
import { TripSnapshot } from "@/components/destination/TripSnapshot";
import { BeforeYouLand } from "@/components/flydrive/FlyDriveSections";
import type { DestinationView } from "@/lib/data/destinations.functions";
import type { DestinationTranslation } from "@/lib/data/translations.functions";

const STORED: { locale: "en" | "de" | "fr"; text: string }[] = [
  { locale: "en", text: "No verified visitor-season recommendation is available for Berowra Valley National Park; consult the park authority for your travel dates." },
  { locale: "en", text: "Check official seasonal information" },
  { locale: "en", text: "Check official seasonal access before choosing dates" },
  { locale: "en", text: "Evidence does not specify a best season; verify weather conditions before travel." },
  { locale: "de", text: "Keine verifizierte Empfehlung für die Besuchersaison ist für Kristianstads Vattenrike verfügbar; konsultieren Sie die Parkbehörde für Ihre Reisedaten." },
  { locale: "de", text: "Überprüfen Sie die offiziellen Saisoninformationen" },
  { locale: "fr", text: "Aucune recommandation vérifiée sur la saison idéale n'est disponible pour Åre ; consultez les autorités locales selon vos dates de voyage." },
  { locale: "fr", text: "Aucune recommandation de saison n'est disponible pour Diamond Hill ; consultez les autorités du parc pour vos dates de visite." },
  { locale: "fr", text: "Consulter les informations saisonnières officielles" },
];
const leak = (out: unknown) => STORED.find((s) => JSON.stringify(out).includes(s.text)) ?? (STORED_UNKNOWN_FACT.test(JSON.stringify(out)) ? { text: "pattern" } : null);

const base = {
  slug: "berowra-valley-national-park-nsw", name: "Berowra Valley National Park", region: "New South Wales", tagline: "A protected national park in northern Sydney.",
  tripDurationDays: "3 days", airportCode: "SYD", airportName: "Sydney Kingsford Smith International Airport", driveMinutes: 46, permitLevel: "moderate" as const,
  permitNote: null, permitHeadline: null, campingScore: 8, heroImage: "https://wildparkroutes.com/x.jpg", gallery: [], photoCredit: null, travelPlan: null,
  destinationType: "national_park", countryCode: "au", accessType: "road",
};

describe("stored 'no verified season' text never reaches output", () => {
  it("is never recognised as a season", () => {
    for (const s of STORED) { expect(isSeasonText(s.text)).toBe(false); expect(genuineSeason(s.text)).toBeNull(); }
  });

  for (const s of STORED) {
    it(`builders omit it (${s.locale}: ${s.text.slice(0, 40)}…)`, () => {
      const d = { ...base, bestSeason: s.text };
      const outputs: Record<string, unknown> = {
        travelDescriptionEn: travelDescription(d, "destination", "fallback"),
        travelDescriptionDe: travelDescription(d, "destination", "fallback", "de"),
        travelDescriptionFlyDrive: travelDescription(d, "fly-and-drive", "fallback"),
        searchDescription: destinationSearchDescription(d.name, d.tagline, d.bestSeason),
        shortAnswer: (["en", "de", "fr"] as const).map((l) => destinationShortAnswer(d, l)),
        destinationFaqs: destinationFaqs(d as never),
        guideJsonLd: destGuideJsonLd({ name: d.name, slug: d.slug, heroImage: d.heroImage, faqs: destinationFaqs(d as never), url: "https://wildparkroutes.com/x", label: "Guide", title: "t" }),
        landingFaqs: ["best_time", "things_to_do", "trip_planner", "glamping"].map((t) => landingFaqs(t, d.name, { bestSeason: d.bestSeason, tripDays: "3 days", airport: "SYD", driveMinutes: 46, permitLevel: "moderate", dailyBudget: null })),
        pins: (["destination", "best_time", "things_to_do", "trip_planner"] as const).map((kind) => [pinTitle({ kind, name: d.name, bestSeason: d.bestSeason } as never), pinDescription({ kind, name: d.name, tagline: d.tagline, bestSeason: d.bestSeason } as never)]),
        permitFallback: ["high", "moderate", "none"].map((lvl) => permitFallback(d.name, lvl, d.bestSeason)),
        decisionBlocks: factItems({ bestSeason: d.bestSeason, tripDays: "3 days", airport: "SYD", driveMinutes: 46, permitLevel: "moderate", dailyBudget: null }).map((f) => f.value),
        destinationJsonLd: buildDestinationJsonLd({ ...(d as unknown as DestinationView), bestSeason: d.bestSeason } as DestinationView, "https://wildparkroutes.com/x"),
      };
      for (const [name, out] of Object.entries(outputs)) expect(leak(out), name).toBeNull();
    });
  }

  it("translated place pages drop a stored translation of the placeholder (de/fr)", () => {
    for (const s of STORED.filter((x) => x.locale !== "en")) {
      const tr = { name: "N", bestSeason: s.text, days: [], intel: [] } as unknown as DestinationTranslation;
      expect(translateDest({ ...(base as unknown as DestinationView), bestSeason: "Check official seasonal information" }, tr).bestSeason).toBeNull();
    }
    const real = { name: "N", bestSeason: "Juni – September", days: [], intel: [] } as unknown as DestinationTranslation;
    expect(translateDest({ ...(base as unknown as DestinationView), bestSeason: "June – September" }, real).bestSeason).toBe("Juni – September");
  });

  it("rendered components (trip snapshot, fly & drive best-time block) omit it in every language", () => {
    for (const s of STORED) for (const path of ["/", "/de/destinations/au/new-south-wales/x", "/fr/destinations/au/new-south-wales/x"]) {
      (globalThis as { __path?: string }).__path = path;
      const html = renderToStaticMarkup(createElement(TripSnapshot, { trip: { airportCode: "SYD", driveMinutes: 46, tripDurationDays: "3 days", bestSeason: s.text, permitLevel: "moderate" } }))
        + renderToStaticMarkup(createElement(BeforeYouLand, { dest: { ...(base as unknown as DestinationView), bestSeason: s.text } }));
      expect(leak(html)).toBeNull();
      expect(html).not.toMatch(/Best season|Best time to fly in/);
    }
  });

  it("a genuine season still shows", () => {
    (globalThis as { __path?: string }).__path = "/";
    const html = renderToStaticMarkup(createElement(TripSnapshot, { trip: { bestSeason: "Late June – September" } }));
    expect(html).toContain("Late June – September");
    expect(travelDescription({ ...base, bestSeason: "Late June – September" }, "destination", "f")).toContain("Best season: Late June – September");
  });
});

// Every source line that reads a stored best season must pass it through genuineSeason/isSeasonText,
// or receive data that the data layer already filtered (listed with the reason).
const PASS_THROUGH: Record<string, string> = {
  "src/routes/destinations.$slug.$region.$place.$guide.tsx": "dest.bestSeason comes from getDestinationPageData (filtered); TripSnapshot/landingFaqs/factItems re-check",
  "src/routes/destinations.$slug.$region.$place.index.tsx": "travelDescription and destinationSearchDescription re-check",
  "src/routes/road-trips.$slug.tsx": "travelDescription re-checks",
  "src/components/destination/TripRadar.tsx": "permitFallback re-checks",
  "src/lib/seo/sitemap.server.ts": "eligibility input only; never rendered",
  "src/lib/seo/rss.server.ts": "pinTitle/pinDescription re-check",
  "src/lib/seo/destinationAnswer.ts": "guarded by isSeasonText",
};
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(n) && !/\.test\./.test(n) ? [p] : []; });
}
describe("no unfiltered best-season reads in the code", () => {
  it("every value use is filtered or a documented pass-through", () => {
    const offenders: string[] = [];
    for (const f of files("src")) {
      if (f.includes("integrations/supabase/types") || f.startsWith("src/data/") || f.startsWith("src/lib/i18n/dict/") || f.endsWith("season.ts")) continue;
      readFileSync(f, "utf8").split("\n").forEach((line, i) => {
        const uses = /(\.bestSeason\b|\bbest_season\b|\bbestSeason:\s*[a-z]\w*\.(best_season|bestSeason))/.test(line);
        const typeOnly = /bestSeason\??:\s*(string|null)/.test(line) || /select\(|\.select\b|"[^"]*best_season[^"]*"|`[^`]*best_season/.test(line) || /^\s*(\/\/|\*)/.test(line);
        if (uses && !typeOnly && !/genuineSeason|isSeasonText/.test(line) && !PASS_THROUGH[f]) offenders.push(`${f}:${i + 1}: ${line.trim().slice(0, 120)}`);
      });
    }
    expect(offenders).toEqual([]);
  });
});
