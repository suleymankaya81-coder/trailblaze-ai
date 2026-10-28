// Classifies outbound partner links for the GA4 `affiliate_click` event.
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
  try { host = new URL(href).hostname.replace(/^www\./, ""); } catch { return null; }
  for (const [re, partner, category] of PARTNERS) if (re.test(host)) return { partner, category };
  return null;
}

export function pageContext(path: string): { page_type: string; destination_slug?: string } {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return { page_type: "home" };
  if (parts[0] === "destinations" && parts[1]) return { page_type: "destination", destination_slug: parts[1] };
  if (parts.length === 1) return { page_type: "landing" };
  return { page_type: parts[0] };
}
