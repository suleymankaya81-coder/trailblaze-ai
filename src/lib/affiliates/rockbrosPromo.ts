/** ROCKBROS visitor discount code supplied by the partner. Hidden automatically after it expires. */
export const ROCKBROS_PROMO = {
  code: "WELCOME10",
  percentOff: 10,
  /** Last valid day (inclusive), US time; we hide after the end of this UTC day + 1 to cover US time zones. */
  validThrough: "2026-12-31",
} as const;

export function activeRockbrosPromo(now: Date = new Date()) {
  const end = new Date(`${ROCKBROS_PROMO.validThrough}T23:59:59-10:00`);
  return now.getTime() <= end.getTime() ? ROCKBROS_PROMO : null;
}
