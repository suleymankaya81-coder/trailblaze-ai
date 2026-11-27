import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", async (orig) => ({
  ...(await orig<typeof import("@tanstack/react-router")>()),
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => unknown }) => select({ location: { pathname: "/de/destinations/se/skane/kristianstads-vattenrike" } }),
}));

import { cleanTravelPlan, knownFactsOnly, knownHeadline } from "./unknownFacts";
import { STORED_UNKNOWN_FACT } from "./season";
import { LocalIntel } from "@/components/destination/TravelFlow";
import { translateDest } from "@/lib/i18n/translateDest";
import { destinationAnswers } from "@/lib/data/destinationAnswers";
import type { TravelPlan } from "@/lib/data/travelPlan";
import type { DestinationView } from "@/lib/data/destinations.functions";
import type { DestinationTranslation } from "@/lib/data/translations.functions";

// Real stored texts (combined-content caches and sample.json translations).
const UNKNOWN = [
  "The reviewed sources do not establish current parking conditions for Geuldal. Check the official visitor information before departure.",
  "The reviewed sources do not establish vehicle size or rental restrictions; do not assume RV access for Geuldal. Check the official visitor information before departure.",
  "Check the official visitor information for Geuldal. Entry, activity permissions and overnight accommodation are separate checks; the source excerpts below do not establish availability for your dates.",
  "Allow time between these sights; local travel times are not verified and conditions vary.",
  "Choose one local visit; travel time and onward transfers are not verified.",
  "Evidence does not specify exact parking capacity or fill times at the trailhead.",
  "Die überprüften Quellen legen keine aktuellen Parkbedingungen für Kristianstads Vattenrike fest. Überprüfen Sie die offiziellen Besucherinformationen vor der Abreise.",
  "Überprüfen Sie die offiziellen Besucherinformationen für Kristianstads Vattenrike vor der Abreise. Eintritt, aktivitätsberechtigungen und Übernachtung sind separate Überprüfungen; die quellenauszüge unten stellen die verfügbarkeit für ihre daten nicht fest.",
  "Wählen Sie einen lokalen Besuch; Reisezeit und Weiterleitungen werden nicht überprüft.",
  "Les sources consultées n'établissent pas les conditions actuelles de stationnement pour le High Coast. Vérifiez les informations officielles avant le départ.",
  "Les sources consultées ne précisent pas la couverture mobile pour Åre. Vérifiez les informations officielles avant le départ.",
  "Choisissez une visite locale ; le temps de trajet et les transferts ultérieurs ne sont pas vérifiés.",
  "Consultez les informations officielles pour Åre avant votre départ. L'entrée, les autorisations d'activités et l'hébergement doivent être vérifiés séparément ; les sources ci-dessous ne garantissent pas la disponibilité pour vos dates.",
];

describe("unknown-fact boilerplate is omitted", () => {
  it("drops every stored 'not established / not verified' text (en/de/fr)", () => {
    for (const t of UNKNOWN) expect(knownFactsOnly(t), t).toBeNull();
  });
  it("keeps the stored fact in a mixed text", () => {
    expect(knownFactsOnly("The dedicated parking area is located on the A855 road. Evidence does not specify current parking capacity.")).toBe("The dedicated parking area is located on the A855 road.");
    expect(knownFactsOnly("À environ 13 km de Skuleberget à vol d'oiseau ; la distance par la route est plus longue, vérifiez donc l'itinéraire avant le départ.")).toContain("13 km");
  });
  it("keeps real reviewed notes and specific instructions (US)", () => {
    for (const g of Object.values(destinationAnswers)) expect(knownFactsOnly(g.reservation.note)).toBe(g.reservation.note);
    expect(knownFactsOnly("Check recreation.gov for timed-entry reservations starting in May.")).toBe("Check recreation.gov for timed-entry reservations starting in May.");
  });
  it("drops the generic reservation headline in every language, keeps real ones", () => {
    for (const h of ["Check visitor access before departure", "Überprüfen Sie den Besucherzugang vor der Abreise", "Vérifiez l'accès des visiteurs avant le départ"]) expect(knownHeadline(h)).toBeNull();
    expect(knownHeadline("Entry pass, separate stay reservations")).toBe("Entry pass, separate stay reservations");
  });
});

const plan: TravelPlan = {
  version: 1,
  days: [{ title: "Geul valley walk", start: "Suggested: 9 AM start", stops: [{ name: "Geuldal", detail: "The valley forms the basin of the Geul and its tributaries." }], driving: UNKNOWN[3], note: UNKNOWN[2] }],
  intel: (["parking", "signal", "fuel", "timing", "access"] as const).map((kind) => ({ kind, title: kind, text: `The reviewed sources do not establish ${kind} information for Geuldal. Check the official visitor information before departure.` })),
  arrival: "The reviewed sources do not establish a measured arrival schedule or supply stops for Geuldal. Check the official visitor information before departure.",
  vehicle: UNKNOWN[1],
  goldenHour: "The reviewed sources do not establish a verified sunrise or sunset viewpoint for Geuldal. Check the official visitor information before departure.",
  sources: [{ label: "Official site", url: "https://example.org" }], markers: [], reviewedAt: "2026-10-01",
};

describe("travel plans as pages show them", () => {
  it("empties unknown fields but keeps stops, sources and array lengths", () => {
    const c = cleanTravelPlan(plan)!;
    expect([c.arrival, c.vehicle, c.goldenHour, c.days[0].driving, c.days[0].note]).toEqual(["", "", "", "", ""]);
    expect(c.intel).toHaveLength(5);
    expect(c.intel.every((i) => i.text === "")).toBe(true);
    expect(c.days[0].stops[0].detail).toBe(plan.days[0].stops[0].detail);
    expect(c.sources).toEqual(plan.sources);
  });
  it("German overlay is cleaned too, and 'Know before you go' disappears when nothing is known", () => {
    const tr = { name: "Kristianstads Vattenrike", days: [{ title: "T", start: "S", driving: UNKNOWN[8], note: UNKNOWN[7], stops: [{ name: "Geuldal", detail: "Das Tal bildet das Einzugsgebiet der Geul." }] }],
      intel: plan.intel.map(() => ({ title: "Parken", text: UNKNOWN[6] })), arrival: null, vehicle: null, goldenHour: null, permitNote: UNKNOWN[7], permitHeadline: "Überprüfen Sie den Besucherzugang vor der Abreise" } as unknown as DestinationTranslation;
    const dest = { slug: "kristianstads-vattenrike", name: "K", travelPlan: cleanTravelPlan(plan), permitNote: null, permitHeadline: null, bestSeason: null } as unknown as DestinationView;
    const de = translateDest(dest, tr);
    expect(de.travelPlan!.days[0].stops[0].detail).toBe("Das Tal bildet das Einzugsgebiet der Geul.");
    expect(de.permitNote).toBeNull();
    expect(de.permitHeadline).toBeNull();
    expect(STORED_UNKNOWN_FACT.test(JSON.stringify(de))).toBe(false);
    expect(renderToStaticMarkup(createElement(LocalIntel, { plan: de.travelPlan! }))).toBe("");
  });
  it("cards with a stored fact still render", () => {
    const p = cleanTravelPlan({ ...plan, intel: [{ kind: "parking", title: "Parking", text: "The car park on the A855 fills by 10 am in summer." }] })!;
    expect(renderToStaticMarkup(createElement(LocalIntel, { plan: p }))).toContain("A855");
  });
});
