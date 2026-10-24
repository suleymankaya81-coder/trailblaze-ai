// Broad U.S. travel regions used by the destinations filter (state → region).
export const US_REGIONS = {
  west: { label: "West Coast & Pacific NW", states: ["California", "Oregon", "Washington", "Nevada"] },
  rockies: { label: "Rockies", states: ["Colorado", "Idaho", "Montana", "Utah", "Wyoming"] },
  southwest: { label: "Southwest", states: ["Arizona", "New Mexico", "Texas", "Oklahoma"] },
  midwest: { label: "Midwest & Plains", states: ["Illinois", "Indiana", "Iowa", "Kansas", "Michigan", "Minnesota", "Missouri", "Nebraska", "North Dakota", "Ohio", "South Dakota", "Wisconsin"] },
  south: { label: "South & Southeast", states: ["Alabama", "Arkansas", "Florida", "Georgia", "Kentucky", "Louisiana", "Mississippi", "North Carolina", "South Carolina", "Tennessee", "Virginia", "West Virginia"] },
  northeast: { label: "Northeast", states: ["Connecticut", "Delaware", "District of Columbia", "Maine", "Maryland", "Massachusetts", "New Hampshire", "New Jersey", "New York", "Pennsylvania", "Rhode Island", "Vermont"] },
  alaska_hawaii: { label: "Alaska & Hawaii", states: ["Alaska", "Hawaii"] },
} as const;
export type UsRegionKey = keyof typeof US_REGIONS;
export const SEASONS = ["spring", "summer", "fall", "winter"] as const;
export const isRegionKey = (v: string | undefined): v is UsRegionKey => !!v && v in US_REGIONS;
