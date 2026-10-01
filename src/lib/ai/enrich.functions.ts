import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { supabase } from "@/integrations/supabase/client";

const EnrichSchema = z.object({
  summary: z
    .string()
    .describe("2-3 sentence cinematic, emotive overview written like a luxury travel magazine."),
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

    const { data: dest, error } = await supabase
      .from("destinations")
      .select("name, region, best_season, trip_duration_days, avg_daily_budget, tagline")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;
    if (!dest) throw new Error("Destination not found");

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      prompt: `You are writing for a premium outdoor-travel guide for ${dest.name} (${dest.region}).

Context:
- Best season: ${dest.best_season}
- Trip length: ${dest.trip_duration_days}
- Avg daily budget per person: $${dest.avg_daily_budget}
- Tagline: ${dest.tagline}

Return ONLY valid JSON (no markdown, no prose) matching exactly this shape:
{
  "summary": "2-3 sentence cinematic, emotive overview",
  "insights": {
    "bestTimeToVisit": "1 sentence",
    "weather": "1 sentence",
    "crowdLevels": "1 sentence",
    "wildlife": "1 sentence",
    "cellCoverage": "1 sentence",
    "safety": "1 sentence",
    "familyFriendly": "1 sentence",
    "petFriendly": "1 sentence"
  },
  "packing": {
    "camping": ["4-6 short items"],
    "clothing": ["4-6 short items"],
    "cooking": ["4-6 short items"],
    "photography": ["4-6 short items"],
    "kids": ["4-6 short items"],
    "pets": ["4-6 short items"]
  },
  "budget": {
    "accommodation": 0,
    "activities": 0,
    "food": 0,
    "fuel": 0,
    "rental": 0,
    "equipment": 0,
    "note": "1 sentence"
  }
}

Budget is USD for a 4-day trip for 2 people, realistic for ${dest.name}. Be specific to ${dest.name}. Never invent operator/lodging names.
Compliance rules for all text: never guarantee prices or availability, never claim to be the cheapest/best deal, never give medical, health or safety guarantees, never use urgency or discount language, and never use partner or merchant brand names in a promotional way. Frame prices and conditions as estimates that can change.`,
    });

    const cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("AI did not return JSON");
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    const object = EnrichSchema.parse(parsed);

    cache.set(data.slug, object);
    return object;
  });
