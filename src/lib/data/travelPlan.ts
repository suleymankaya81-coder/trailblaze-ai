import { z } from "zod";

const source = z.object({ label: z.string().min(3), url: z.string().url().startsWith("https://") });
export const travelPlanSchema = z.object({
  version: z.literal(1),
  days: z.array(z.object({
    title: z.string().min(5), start: z.string().min(3),
    stops: z.array(z.object({ name: z.string().min(3), detail: z.string().min(20), routingName: z.string().optional(), placePath: z.string().startsWith("/destinations/").optional() })).min(1),
    driving: z.string().min(10), note: z.string().min(15),
  })).min(1),
  intel: z.array(z.object({
    kind: z.enum(["parking", "signal", "fuel", "timing", "access"]),
    title: z.string().min(3), text: z.string().min(30),
  })).min(1).max(6), // five standard notes; ferry places add a sixth sourced access note
  arrival: z.string().min(40), vehicle: z.string().min(40), goldenHour: z.string().min(40),
  sources: z.array(source).min(1),
  markers: z.array(z.object({ name: z.string(), lng: z.number().min(-180).max(180), lat: z.number().min(-90).max(90), sourceUrl: z.string().url() })).default([]),
  reviewedAt: z.string(),
});
export type TravelPlan = z.infer<typeof travelPlanSchema>;
export type TravelMarker = TravelPlan["markers"][number];
export function parseTravelPlan(value: unknown): TravelPlan | null {
  const result = travelPlanSchema.safeParse(value);
  return result.success ? result.data : null;
}