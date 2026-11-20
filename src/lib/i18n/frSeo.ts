import { COUNTRIES, countryPath, regionPath } from "@/lib/routes/paths";
import type { Crumb } from "@/lib/seo/breadcrumbs";

// French crumbs mirror the English hierarchy under /fr.
export const HOME_FR: Crumb = { name: "Accueil", path: "/fr" };
export const DESTINATIONS_FR: Crumb = { name: "Destinations", path: "/fr/destinations" };

export const frMeta = (title: string, description: string, url: string) => [
  { title },
  { name: "description", content: description },
  { property: "og:title", content: title },
  { property: "og:description", content: description },
  { property: "og:locale", content: "fr_FR" },
  { property: "og:url", content: url },
];

/** French trail: Accueil › Destinations › Pays › Région (region optional). */
export function frGeoCrumbs(country: string, region?: { slug: string; name: string }): Crumb[] {
  const crumbs: Crumb[] = [HOME_FR, DESTINATIONS_FR, { name: COUNTRIES[country]?.nameFr ?? country.toUpperCase(), path: countryPath(country, "fr") }];
  if (region) crumbs.push({ name: region.name, path: regionPath(country, region.slug, "fr") });
  return crumbs;
}

/** "en France", "aux États-Unis", "au Canada" … */
export function frIn(country: string): string {
  const name = COUNTRIES[country]?.nameFr ?? country.toUpperCase();
  if (["us", "nl"].includes(country)) return `aux ${name}`;
  if (["ca", "pt", "dk", "lu", "me", "gb"].includes(country)) return `au ${name}`;
  if (["is", "ie", "it", "es", "fr", "de", "at", "ch", "gr", "no", "se", "fi", "be", "pl", "ro", "sk", "cz", "hu", "si", "hr", "al", "mk", "ba", "rs", "bg", "ee", "lv", "lt", "au", "nz"].includes(country)) return `en ${name}`;
  return `à ${name}`;
}
