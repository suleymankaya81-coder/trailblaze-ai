import { stripLocale } from "./i18n/locales";
// Classifies outbound partner links for the GA4 `affiliate_click` event.
const AWIN_PARTNERS: Record<string, { partner: string; category: string }> = {
  "22326": { partner: "campspot", category: "stay" },
  "32065": { partner: "roverpass", category: "stay" },
  "111454": { partner: "harvest_hosts", category: "stay" },
  "58007": { partner: "rockbros", category: "gear" },
  "126831": { partner: "wildguarder", category: "gear" },
  "59183": { partner: "jackery", category: "gear" },
  "49127": { partner: "generali", category: "insurance" },
  "99589": { partner: "bnesim", category: "esim" },
  "29649": { partner: "outdooractive", category: "maps" },
};
const TP_PARTNERS: Record<string, { partner: string; category: string }> = {
  airalo: { partner: "airalo", category: "esim" },
  ektatraveling: { partner: "ekta", category: "insurance" },
  radicalstorage: { partner: "radicalstorage", category: "luggage" },
  aviasales: { partner: "aviasales", category: "flight" },
  klook: { partner: "klook", category: "tour" },
  tiqets: { partner: "tiqets", category: "tour" },
  gocity: { partner: "gocity", category: "tour" },
  bikesbooking: { partner: "bikesbooking", category: "bike" },
};
const PARTNERS: [RegExp, string, string][] = [
  [/motorhomerepublic\.com$/, "motorhome_republic", "rv"],
  [/airportrentals\.com$/, "airport_rentals", "car"],
  [/viator\.com$/, "viator", "tour"],
  [/vrbo\.com$/, "vrbo", "stay"],
  [/expedia\.com$/, "expedia", "stay"],
  [/harvesthosts\.com$/, "harvest_hosts", "stay"],
  [/rei\.com$/, "rei", "gear"],
  [/(tpm\.lv|tp\.media|aviasales\.com)$/, "travelpayouts", "flight"],
  [/awin1\.com$/, "awin", "gear"],
  [/shareasale\.com$/, "shareasale", "stay"],
];

export function classifyPartnerLink(href: string): { partner: string; category: string } | null {
  let host: string;
  let url: URL;
  try { url = new URL(href); host = url.hostname.replace(/^www\./, ""); } catch { return null; }
  if (host === "awin1.com") return AWIN_PARTNERS[url.searchParams.get("awinmid") ?? ""] ?? { partner: "awin", category: "gear" };
  if (host.endsWith(".tpm.lv")) return TP_PARTNERS[host.split(".")[0] ?? ""] ?? { partner: "travelpayouts", category: "other" };
  for (const [re, partner, category] of PARTNERS) if (re.test(host)) return { partner, category };
  return null;
}

export function pageContext(path: string): { page_type: string; destination_slug?: string } {
  const parts = stripLocale(path.split("?")[0] ?? path).split("/").filter(Boolean);
  if (parts.length === 0) return { page_type: "home" };
  if (parts[0] === "destinations" && parts.length >= 4) return { page_type: "destination", destination_slug: parts[3] };
  if (parts[0] === "destinations" && parts.length === 2 && (parts[1]?.length ?? 0) > 2) return { page_type: "destination", destination_slug: parts[1] };
  if (parts[0] === "destinations") return { page_type: "destination_directory" };
  if (parts.length === 1) return { page_type: "landing" };
  return { page_type: parts[0] };
}
