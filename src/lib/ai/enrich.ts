/** Closed permanently for page visits and stale client requests. No I/O. */
export async function rejectLiveEnrichment(): Promise<never> {
  throw new Error("Live destination enrichment is disabled");
}