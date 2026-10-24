// Fixed booking order shown on route pages: flight → vehicle → data → tours.
export const BOOKING_STEPS = [
  { key: "flight", label: "Find your flight" },
  { key: "vehicle", label: "Reserve your car or RV" },
  { key: "data", label: "Set up mobile data" },
  { key: "tours", label: "Browse tours" },
] as const;
