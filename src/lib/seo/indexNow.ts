import { SITE_ORIGIN } from "@/config/site";

/** IndexNow key; served as public/e30e5c8f5cb37300c499a62294390bb2.txt (file name = key = content). */
export const INDEXNOW_KEY = "e30e5c8f5cb37300c499a62294390bb2";
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
/** IndexNow accepts at most 10,000 URLs per request. */
export const INDEXNOW_MAX_URLS = 10_000;

export type IndexNowPayload = { host: string; key: string; keyLocation: string; urlList: string[] };

/** https URLs on the site's own host only, de-duplicated (IndexNow rejects foreign hosts). */
export function indexNowUrls(urls: readonly string[]): string[] {
  const host = new URL(SITE_ORIGIN).host;
  const out = new Set<string>();
  for (const raw of urls) {
    try {
      const u = new URL(raw.trim());
      if (u.protocol === "https:" && u.host === host) out.add(u.toString());
    } catch {
      /* not a URL */
    }
  }
  return [...out];
}

export function indexNowPayloads(urls: readonly string[]): IndexNowPayload[] {
  const list = indexNowUrls(urls);
  const host = new URL(SITE_ORIGIN).host;
  const out: IndexNowPayload[] = [];
  for (let i = 0; i < list.length; i += INDEXNOW_MAX_URLS)
    out.push({ host, key: INDEXNOW_KEY, keyLocation: `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`, urlList: list.slice(i, i + INDEXNOW_MAX_URLS) });
  return out;
}

/** POST each batch; returns [urls, HTTP status] per request (200/202 = accepted). */
export async function submitIndexNow(urls: readonly string[], fetchImpl: typeof fetch = fetch): Promise<{ urls: number; status: number }[]> {
  const results: { urls: number; status: number }[] = [];
  for (const body of indexNowPayloads(urls)) {
    const res = await fetchImpl(INDEXNOW_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(body) });
    results.push({ urls: body.urlList.length, status: res.status });
  }
  return results;
}
