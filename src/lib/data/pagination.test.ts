import { describe, expect, it } from "vitest";
import { collectPages } from "./pagination";

describe("translation directory pagination", () => {
  it("retains all 3231 destinations rather than only the first 1000", async () => {
    const records = Array.from({ length: 3231 }, (_, i) => i);
    const result = await collectPages(async (from, to) => records.slice(from, to + 1));
    expect(result).toHaveLength(3231);
    expect(result[3230]).toBe(3230);
  });
  it("propagates later-page failures instead of returning partial lists", async () => {
    await expect(collectPages(async from => {
      if (from > 0) throw new Error("Read failed");
      return Array.from({ length: 1000 }, (_, i) => i);
    })).rejects.toThrow("Read failed");
  });
});