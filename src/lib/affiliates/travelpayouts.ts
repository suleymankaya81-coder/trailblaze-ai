// Travelpayouts tracked short links (tpm.lv), issued per brand in the dashboard.
export const TP_LINKS = {
  airalo: "https://airalo.tpm.lv/Cl55ghx0",
  economybookings: "https://economybookings.tpm.lv/Ldg7kknv",
  bikesbooking: "https://bikesbooking.tpm.lv/Q26wdHFR",
  klook: "https://klook.tpm.lv/nayF33og",
  ekta: "https://ektatraveling.tpm.lv/uPEvRPbe",
  tiqets: "https://tiqets.tpm.lv/wCgtWj6C",
  gocity: "https://gocity.tpm.lv/pZP8UD8I",
  radicalstorage: "https://radicalstorage.tpm.lv/cRmtR6gn",
  aviasales: "https://aviasales.tpm.lv/oJDSEshT",
  qeeq: "https://qeeq.tpm.lv/uGwBnrsc",
} as const;

export type TpBrand = keyof typeof TP_LINKS;

/** Approved providers for the existing before-road service rows. */
export const ROAD_PREPARATION_PARTNERS = {
  insurance: "ekta",
  esim: "airalo",
  offline_maps: "radicalstorage",
  car_rental: "economybookings",
} as const satisfies Record<string, TpBrand>;

/** Adds sub_id (destination slug) so Travelpayouts reports show which page earned the click. */
export function tpLink(brand: TpBrand, subId?: string): string {
  const url = new URL(TP_LINKS[brand]);
  if (subId) url.searchParams.set("sub_id", subId.replace(/[^a-z0-9-]/gi, "").slice(0, 60));
  return url.toString();
}

// Destinations near Go City's US cities (slug substrings).
const GO_CITY_NEAR = ["las-vegas", "red-rock", "valley-of-fire", "san-francisco", "muir-woods", "san-diego", "los-angeles", "new-york", "boston", "chicago", "miami", "everglades", "oahu", "seattle", "washington"];
export function nearGoCity(slug: string): boolean {
  return GO_CITY_NEAR.some((s) => slug.includes(s));
}
