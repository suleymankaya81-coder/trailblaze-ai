// Shared, browser-safe labels for search-page types.
export const LANDING_TYPE_LABEL: Record<string, string> = {
  best_time: "Best time to visit",
  things_to_do: "Things to do",
  trip_planner: "Itinerary",
  glamping: "Glamping",
};

// Offer categories shown on each page type (filtered from Awin/info offers).
export const LANDING_TYPE_OFFERS: Record<string, string[]> = {
  best_time: ["stay", "activity"],
  things_to_do: ["activity"],
  trip_planner: ["stay", "rv_rental", "gear_rental"],
  glamping: ["stay"],
};

export type LandingSection = { heading: string; body: string };
