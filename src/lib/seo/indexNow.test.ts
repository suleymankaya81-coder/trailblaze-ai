import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { INDEXNOW_KEY, INDEXNOW_MAX_URLS, indexNowPayloads, indexNowUrls, submitIndexNow } from "./indexNow";

describe("IndexNow", () => {
  it("uses the key file that is already deployed", () => {
    expect(readFileSync(`public/${INDEXNOW_KEY}.txt`, "utf8").trim()).toBe(INDEXNOW_KEY);
  });
  it("only sends https URLs on the site host, once each", () => {
    expect(indexNowUrls(["https://wildparkroutes.com/a", "https://wildparkroutes.com/a", "http://wildparkroutes.com/b", "https://minialife.com/c", "nonsense"]))
      .toEqual(["https://wildparkroutes.com/a"]);
  });
  it("splits into requests of at most 10,000 URLs with the key location", () => {
    const urls = Array.from({ length: 20_001 }, (_, i) => `https://wildparkroutes.com/p${i}`);
    const p = indexNowPayloads(urls);
    expect(p.map((x) => x.urlList.length)).toEqual([INDEXNOW_MAX_URLS, INDEXNOW_MAX_URLS, 1]);
    expect(p[0]).toMatchObject({ host: "wildparkroutes.com", key: INDEXNOW_KEY, keyLocation: `https://wildparkroutes.com/${INDEXNOW_KEY}.txt` });
  });
  it("posts each batch to the IndexNow endpoint", async () => {
    const calls: { url: string; body: { urlList: string[] } }[] = [];
    const fake = (async (url: string, init: RequestInit) => { calls.push({ url, body: JSON.parse(String(init.body)) }); return new Response(null, { status: 202 }); }) as unknown as typeof fetch;
    expect(await submitIndexNow(["https://wildparkroutes.com/destinations/us/utah/zion"], fake)).toEqual([{ urls: 1, status: 202 }]);
    expect(calls[0].url).toBe("https://api.indexnow.org/indexnow");
    expect(calls[0].body.urlList).toEqual(["https://wildparkroutes.com/destinations/us/utah/zion"]);
  });
  it("sends nothing when no valid URL remains", async () => {
    const fake = (async () => { throw new Error("must not be called"); }) as unknown as typeof fetch;
    expect(await submitIndexNow(["https://example.org/x"], fake)).toEqual([]);
  });
});
