import { SITE_ORIGIN } from "@/config/site";
import { toCurrentOrigin } from "./originUrl";
// Pure helpers for image SEO: credit parsing and absolute URLs.
const BASE_URL = SITE_ORIGIN;

export type ImageCredit = { creator: string; license: string; licenseUrl: string | null; source?: string; sourceUrl?: string };

const LICENSES: [RegExp, (v: string) => string][] = [
  [/^CC BY-SA (\d\.\d)$/i, (v) => `https://creativecommons.org/licenses/by-sa/${v}/`],
  [/^CC BY (\d\.\d)$/i, (v) => `https://creativecommons.org/licenses/by/${v}/`],
  [/^CC0( 1\.0)?$/i, () => "https://creativecommons.org/publicdomain/zero/1.0/"],
  [/^Public domain$/i, () => "https://creativecommons.org/publicdomain/mark/1.0/"],
  [/^Pexels License$/i, () => "https://www.pexels.com/license/"],
  [/^Unsplash License$/i, () => "https://unsplash.com/license"],
];

export function licenseUrl(license: string): string | null {
  for (const [re, build] of LICENSES) {
    const m = license.trim().match(re);
    if (m) return build(m[1]?.trim() ?? "");
  }
  return null;
}

function parseOne(text: string): ImageCredit | null {
  const m = text.trim().match(/^(.+?)\s*\/\s*(.+?)\s+via (.+?)(?:\s+\|\s+(https:\/\/\S+))?$/i);
  if (!m) return null;
  const creator = m[1].trim();
  const license = m[2].trim();
  if (!creator || /^unknown$/i.test(creator)) return null;
  const source = m[3].trim();
  const sourceUrl = m[4];
  return { creator, license, licenseUrl: licenseUrl(license), ...(source !== "Wikimedia Commons" ? { source } : {}), ...(sourceUrl ? { sourceUrl } : {}) };
}

// "Hero: A / licence via provider | https://source-page · Gallery: B / ..."
export function parsePhotoCredit(text: string | null | undefined): { hero: ImageCredit | null; gallery: (ImageCredit | null)[] } {
  if (!text) return { hero: null, gallery: [] };
  const [heroPart, galleryPart] = text.split(" · Gallery:");
  const hero = parseOne(heroPart.replace(/^Hero:\s*/, ""));
  // Split gallery credits only on "; " that follows "via Wikimedia Commons".
  const gallery = galleryPart ? galleryPart.split(/(?<=via Wikimedia Commons);\s*/i).map(parseOne) : [];
  return { hero, gallery };
}

// Words that mark an organisation, not a person (park services, agencies, tourism boards, companies).
const ORG_WORDS = /\b(national|parks|nationalpark|naturpark|service|nps|usfws|usda|forest service|agency|department|dept|office|ministry|authority|commission|government|county|city of|state of|council|trust|foundation|society|association|institute|university|college|museum|library|archive|archives|survey|tourism|tourist|visit|board|bureau|inc|ltd|llc|gmbh|team|staff|wikimedia|commons)\b/i;
// Credit text that is not a name at all ("own work" in several languages, unknown or anonymous authors).
const NOT_A_NAME = /(unknown|anonymous|anonym|own work|eigenes werk|travail personnel|trabajo propio|trabalho meu|opera propria|arquivo pessoal|https?:)/i;

/** The name inside common Commons/Flickr credit wrappers ("User:X", "The original uploader was X at …", "X from City"). */
export function creditName(raw: string): string {
  return raw
    .replace(/^The original uploader was\s+/i, "")
    .replace(/\s+at\s+[A-Za-z]+ Wikipedia\.?$/i, "")
    .replace(/^User:/i, "")
    .replace(/\s+from\s+[^,]+(,\s*[^,]+)*$/i, "")
    .replace(/^\((.+)\)$/, "$1")
    .trim();
}

/**
 * schema.org entity for a photo creator. Organisations (e.g. a park's own photo account such as
 * "Zion National Park") become Organization; text that is not a name returns null so no creator
 * is emitted (creditText still carries the attribution). Only the remaining names become Person.
 */
export function creditCreatorEntity(raw: string, placeName?: string | null): Record<string, string> | null {
  const name = creditName(raw);
  // Must contain at least one letter in any script (Greek, Cyrillic, … count).
  if (!name || NOT_A_NAME.test(name) || !/\p{L}/u.test(name)) return null;
  const isPlace = !!placeName && name.toLowerCase() === placeName.trim().toLowerCase();
  if (isPlace || ORG_WORDS.test(name)) return { "@type": "Organization", name };
  return { "@type": "Person", name };
}

export function toAbsoluteImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Legacy-domain asset URLs (minialife.com/__l5e/…) are served on the current origin.
  const trimmed = toCurrentOrigin(url.trim());
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return `${BASE_URL}${trimmed}`;
  return trimmed.startsWith("https://") ? trimmed : null;
}

// thumb/x/xx/Name.jpg/1920px-Name.jpg → commons File: page.
export function commonsFilePage(url: string): string | null {
  const m = url.match(/\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/?#]+)/i);
  return m ? `https://commons.wikimedia.org/wiki/File:${m[1]}` : null;
}
