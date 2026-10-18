// Pure helpers for image SEO: credit parsing and absolute URLs.
const BASE_URL = "https://minialife.com";

export type ImageCredit = { creator: string; license: string; licenseUrl: string | null };

const LICENSES: [RegExp, (v: string) => string][] = [
  [/^CC BY-SA (\d\.\d)$/i, (v) => `https://creativecommons.org/licenses/by-sa/${v}/`],
  [/^CC BY (\d\.\d)$/i, (v) => `https://creativecommons.org/licenses/by/${v}/`],
  [/^CC0( 1\.0)?$/i, () => "https://creativecommons.org/publicdomain/zero/1.0/"],
  [/^Public domain$/i, () => "https://creativecommons.org/publicdomain/mark/1.0/"],
];

export function licenseUrl(license: string): string | null {
  for (const [re, build] of LICENSES) {
    const m = license.trim().match(re);
    if (m) return build(m[1]?.trim() ?? "");
  }
  return null;
}

function parseOne(text: string): ImageCredit | null {
  const m = text.trim().match(/^(.+?)\s*\/\s*(.+?)\s+via Wikimedia Commons$/i);
  if (!m) return null;
  const creator = m[1].trim();
  const license = m[2].trim();
  if (!creator || /^unknown$/i.test(creator)) return null;
  return { creator, license, licenseUrl: licenseUrl(license) };
}

// "Hero: A / CC BY-SA 3.0 via Wikimedia Commons · Gallery: B / ...; C / ..."
export function parsePhotoCredit(text: string | null | undefined): { hero: ImageCredit | null; gallery: (ImageCredit | null)[] } {
  if (!text) return { hero: null, gallery: [] };
  const [heroPart, galleryPart] = text.split(" · Gallery:");
  const hero = parseOne(heroPart.replace(/^Hero:\s*/, ""));
  // Split gallery credits only on "; " that follows "via Wikimedia Commons".
  const gallery = galleryPart ? galleryPart.split(/(?<=via Wikimedia Commons);\s*/i).map(parseOne) : [];
  return { hero, gallery };
}

export function toAbsoluteImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return `${BASE_URL}${trimmed}`;
  return trimmed.startsWith("https://") ? trimmed : null;
}

// thumb/x/xx/Name.jpg/1920px-Name.jpg → commons File: page.
export function commonsFilePage(url: string): string | null {
  const m = url.match(/\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/?#]+)/i);
  return m ? `https://commons.wikimedia.org/wiki/File:${m[1]}` : null;
}
