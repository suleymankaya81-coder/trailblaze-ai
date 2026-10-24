// Fixed trip booking stages; mobile data is supporting preparation, not a numbered booking stage.
export const BOOKING_STEPS = [
  { key: "flight", label: "Find your flight" },
  { key: "vehicle", label: "Reserve your car or RV" },
  { key: "stay", label: "Choose your stay" },
  { key: "tours", label: "Browse tours" },
  { key: "gear", label: "Choose trip essentials" },
] as const;
