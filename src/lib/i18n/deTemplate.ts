import { tp } from "./index";
import { hreflangLinks } from "@/lib/seo/hreflang";

const SITE = "https://minialife.com";
type Tag = Record<string, unknown>;
type Head = { meta?: Tag[]; links?: Tag[]; scripts?: Tag[] } | undefined;

const toPath = (url: string) => url.startsWith(SITE) ? url.slice(SITE.length) || "/" : url;
const toDe = (url: string) => { const p = toPath(url); return `${SITE}/de${p === "/" ? "" : p}`; };

/** hreflang pair for an English template page that also has a /de version. */
export function deAlternates(canonical: string) {
  return hreflangLinks(toPath(canonical), ["en", "de"]);
}

/** Turn an English template head into its /de counterpart: German fixed wording, /de canonical, hreflang. */
export function deHead(head: Head): Head {
  if (!head) return head;
  const canonical = head.links?.find((l) => l.rel === "canonical")?.href as string | undefined;
  const meta = (head.meta ?? []).map((m) => {
    if (typeof m.title === "string") return { ...m, title: tp("de", m.title) };
    if ((m.name === "description" || m.property === "og:description" || m.property === "og:title") && typeof m.content === "string")
      return { ...m, content: tp("de", m.content) };
    if (m.property === "og:url" && typeof m.content === "string") return { ...m, content: toDe(m.content) };
    return m;
  });
  if (!canonical) return { ...head, meta };
  return {
    ...head,
    meta: [...meta, { property: "og:locale", content: "de_DE" }],
    links: [{ rel: "canonical", href: toDe(canonical) }, ...deAlternates(canonical)],
  };
}
