import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { rejectLiveEnrichment } from "./enrich";

// Tombstone for older clients: never query data or call an AI provider.
export const enrichDestination = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ slug: z.string() }).parse(input))
  .handler(async (): Promise<never> => {
    return rejectLiveEnrichment();
  });
