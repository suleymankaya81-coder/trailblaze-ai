/** Canada-wide benchmarks, not live partner quotes. Reviewed 15 November 2026. */
export const CANADA_PRICE_BASIS = {
  exchangeDate: "2026-11-13", cadPerUsd: 1.4257,
  exchangeSource: "https://www.bankofcanada.ca/rates/daily-digest/",
  carSource: "https://www.ca.kayak.com/Canada-Car-Rentals.43.crc.html",
  rvSource: "https://gorvrentals.com/blog/canada-rv-rental-price-trends-historical-rates",
  hotelSource: "https://www.ca.kayak.com/Canada-Hotels.43.dc.html",
  cad: { car: 52, suv: 72, campervan: 231, motorhome: 232, hotel: 243 },
} as const;
export const cadToUsd = (value: number): number => Math.round(value / CANADA_PRICE_BASIS.cadPerUsd);
export function canadaEstimate(text: string): string {
  const t = text.toLowerCase(), c = CANADA_PRICE_BASIS.cad;
  const entry = /camper|sleeps 2|2-berth|\bvan\b/.test(t) ? [c.campervan, "day"] as const
    : /motorhome|\brv\b/.test(t) ? [c.motorhome, "day"] as const
    : /\bsuv\b/.test(t) ? [c.suv, "day"] as const
    : /car|sedan/.test(t) ? [c.car, "day"] as const
    : /hotel|lodge|inn|resort/.test(t) ? [c.hotel, "night"] as const : null;
  return entry ? `Est. avg. US$${cadToUsd(entry[0])}/${entry[1]}` : "Check live price";
}