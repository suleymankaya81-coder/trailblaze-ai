import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DAY = 24 * 60 * 60 * 1000;

/** Cheapest recent fare into an airport (Aviasales Data API), cached 24h per airport. */
export const getFlightPrice = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ airport: z.string().regex(/^[A-Z]{3}$/) }).parse(d))
  .handler(async ({ data }): Promise<{ price: number | null; origin: string | null }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cached } = await supabaseAdmin
      .from("flight_price_cache")
      .select("price, origin, fetched_at")
      .eq("airport_code", data.airport)
      .maybeSingle();
    if (cached && Date.now() - new Date(cached.fetched_at).getTime() < DAY) {
      return { price: cached.price != null ? Number(cached.price) : null, origin: cached.origin };
    }
    const token = process.env["AVIASALES_API_TOKEN"];
    if (!token) return { price: null, origin: null };
    try {
      const res = await fetch(
        `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?destination=${data.airport}&currency=usd&sorting=price&limit=1&token=${token}`,
      );
      const json = (await res.json()) as { data?: { price: number; origin: string }[] };
      const top = json.data?.[0];
      const row = { airport_code: data.airport, price: top?.price ?? null, origin: top?.origin ?? null, fetched_at: new Date().toISOString() };
      await supabaseAdmin.from("flight_price_cache").upsert(row);
      return { price: row.price, origin: row.origin };
    } catch (e) {
      console.error("[getFlightPrice]", e);
      return { price: null, origin: null };
    }
  });
