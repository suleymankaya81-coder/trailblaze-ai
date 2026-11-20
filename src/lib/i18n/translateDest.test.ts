import { expect, it } from "vitest";
import { translatePlan } from "./translateDest";
import type { TravelPlan } from "@/lib/data/travelPlan";

it("keeps original map coordinates and park links when overlaying French prose", () => {
  const plan: TravelPlan = { version: 1, reviewedAt: "2026-11-20", days: [{ title: "Day trip", start: "Start morning", driving: "Check the route before departure", note: "Check the official access information", stops: [{ name: "Acadia", detail: "Visit the published Acadia guide", placePath: "/destinations/us/maine/acadia" }] }], intel: [{ kind: "access", title: "Access", text: "Consult the official park before departure" }], arrival: "Arrival", vehicle: "Vehicle", goldenHour: "Sunset", sources: [{ label: "Official", url: "https://www.nps.gov/acad/" }], markers: [{ name: "Acadia", lat: 44.35, lng: -68.21, sourceUrl: "https://www.nps.gov/acad/" }] };
  const tr = { name: "Acadia", metaTitle: "Acadia", metaDescription: "Acadia", days: [{ title: "Excursion", start: "Départ le matin", driving: "Vérifiez le trajet", note: "Consultez les informations officielles", stops: [{ name: "Acadia", detail: "Consultez le guide du parc", placePath: "/incorrect-path" }] }], intel: [{ title: "Accès", text: "Consultez les informations officielles" }] };
  const result = translatePlan(plan, tr);
  expect(result?.days[0]?.stops[0]?.placePath).toBe("/destinations/us/maine/acadia");
  expect(result?.markers[0]).toEqual(plan.markers[0]);
  expect(result?.days[0]?.title).toBe("Excursion");
  expect(result?.sources).toEqual(plan.sources);
});