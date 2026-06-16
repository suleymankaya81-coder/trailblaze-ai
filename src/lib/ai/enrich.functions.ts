import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { getDestination } from "@/data/destinations";

const EnrichSchema = z.object({
  summary: z.string().describe("2-3 sentence cinematic, emotive overview written like a luxury travel magazine."),
  insights: z.object({
    bestTimeToVisit: z.string(),
    weather: z.string(),
    crowdLevels: z.string(),
    wildlife: z.string(),
    cellCoverage: z.string(),
    safety: z.string(),
    familyFriendly: z.string(),
    petFriendly: z.string(),
  }),
  packing: z.object({
    camping: z.array(z.string()),
    clothing: z.array(z.string()),
    cooking: z.array(z.string()),
    photography: z.array(z.string()),
    kids: z.array(z.string()),
    pets: z.array(z.string()),
  }),
  budget: z.object({
    accommodation: z.number(),
    activities: z.number(),
    food: z.number(),
    fuel: z.number(),
    rental: z.number(),
    equipment: z.number(),
    note: z.string(),
  }),
});

export type EnrichResult = z.infer<typeof EnrichSchema>;

const cache = new Map<string, EnrichResult>();

export const enrichDestination = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ slug: z.string() }).parse(input))
  .handler(async ({ data }): Promise<EnrichResult> => {
    const cached = cache.get(data.slug);
    if (cached) return cached;

    const dest = getDestination(data.slug);
    if (!dest) throw new Error("Destination not found");

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const { experimental_output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      experimental_output: Output.object({ schema: EnrichSchema }),
      prompt: `You are writing for a premium outdoor-travel guide for ${dest.name} (${dest.region}).

Context:
- Best season: ${dest.bestSeason}
- Trip length: ${dest.tripDurationDays}
- Avg daily budget per person: $${dest.avgDailyBudget}
- Tagline: ${dest.tagline}

Write:
1. A 2-3 sentence cinematic summary that makes someone want to book a trip tonight. No hype, no clichés.
2. 8 destination insights (each 1 short sentence): best time, weather, crowds, wildlife, cell coverage, safety, family-friendliness, pet-friendliness.
3. A packing checklist grouped by camping, clothing, cooking, photography, kids, pets. 4-6 items per group. Concise item names only.
4. A trip budget breakdown for a 4-day trip for 2 people in USD across accommodation, activities, food, fuel, rental, equipment. Realistic for this destination. Plus a 1-sentence note.

Be specific to ${dest.name}. Never invent operator/lodging names.`,
    });

    cache.set(data.slug, experimental_output);
    return experimental_output;
  });
