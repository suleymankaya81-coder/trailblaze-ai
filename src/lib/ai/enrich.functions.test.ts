import { afterEach, describe, expect, it, vi } from "vitest";
import { rejectLiveEnrichment } from "./enrich";

afterEach(() => vi.unstubAllGlobals());

describe("disabled live destination enrichment", () => {
  it("rejects even older-client calls without making any paid AI or database request", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(rejectLiveEnrichment()).rejects.toThrow("Live destination enrichment is disabled");
    expect(fetch).not.toHaveBeenCalled();
  });
});