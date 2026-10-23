import { MORE_CORRIDORS } from "./corridors.more";
// International entry corridors: hand-written, reviewed copy for overseas visitors.
// Pilot pages stay noindex until approved.
export type Corridor = {
  slug: string;
  title: string;
  gateway: { code: string; name: string };
  region: string;
  idealDays: string;
  intro: string;
  audience: string;
  stops: string[];
  essentials: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
  pilot: boolean;
  /** City named on booking cards and the start section. */
  gatewayCity: string;
  /** Viator free-text searches; `code` pins a reviewed product, otherwise the top valid result is used. */
  experiences: { search: string; stop: string; code?: string }[];
  /** Optional note shown between stops (places without their own guide). */
  legNotes?: Record<string, string>;
  /** Region group on the /corridors hub. */
  area?: string;
};

const ESTA = { title: "Entry: ESTA or visa", text: "Visa Waiver Program travellers need an approved ESTA before boarding. Apply only on the official U.S. government ESTA website and allow at least 72 hours." };
const LICENCE = { title: "Driving licence", text: "A valid licence in the Latin alphabet is generally accepted for rentals; an International Driving Permit is recommended alongside it and required by some rental desks." };

export const CORRIDORS: Corridor[] = [
  {
    slug: "grand-circle-from-las-vegas",
    title: "The Grand Circle from Las Vegas",
    gateway: { code: "LAS", name: "Harry Reid International Airport, Las Vegas" },
    region: "Nevada · Utah · Arizona",
    idealDays: "10–14 days",
    intro:
      "Land in Las Vegas, pick up a car and drive a loop through Zion, Bryce Canyon, Page and the Grand Canyon before returning the car where you started — no one-way drop fee.",
    audience:
      "Built for visitors flying in from Europe, the UK and Australia who have two weeks, want to drive themselves and want the classic Southwest parks in one trip.",
    stops: ["las-vegas", "zion", "bryce-canyon", "antelope-canyon", "horseshoe-bend", "grand-canyon"],
    essentials: [
      { title: "Entry: ESTA or visa", text: "Visa Waiver Program travellers need an approved ESTA before boarding. Apply only on the official U.S. government ESTA website and allow at least 72 hours." },
      { title: "Driving licence", text: "A valid licence in the Latin alphabet is generally accepted for rentals; an International Driving Permit is recommended alongside it and required by some rental desks." },
      { title: "One park pass for the whole loop", text: "The America the Beautiful annual pass covers entrance fees at Zion, Bryce Canyon and the Grand Canyon. Since 2026 non-U.S. residents pay a higher price; check the current rate on the NPS website." },
      { title: "Time zones change", text: "Nevada and Utah observe daylight saving time; most of Arizona does not, while the Navajo Nation does. Re-check tour start times around Page." },
      { title: "Antelope Canyon is guided only", text: "Antelope Canyon can only be visited with a licensed Navajo tour operator. Book a time slot before you leave home." },
      { title: "Heat and distances", text: "Summer temperatures in Las Vegas and Page can pass 40 °C. Carry plenty of water and fill up before long stretches between towns." },
    ],
    faqs: [
      { q: "How many days do I need for the Grand Circle from Las Vegas?", a: "Plan 10 to 14 days. That allows two nights at Zion and the Grand Canyon, one or two at Bryce Canyon and Page, and a rest night in Las Vegas at each end to recover from jet lag." },
      { q: "Do I need to return the rental car to Las Vegas?", a: "Driving the loop back to Las Vegas lets you return the car at the same airport, which usually avoids one-way drop fees." },
      { q: "Which months are best for overseas visitors?", a: "April–May and September–October bring milder temperatures. Summer is very hot in the desert sections, and winter can close roads or bring snow at Bryce Canyon and the Grand Canyon's higher rims." },
    ],
    pilot: false,
    gatewayCity: "Las Vegas",
    experiences: [
      { code: "142864P1", search: "Antelope Canyon tour Page Arizona", stop: "Page · Antelope Canyon" },
      { code: "275883P1", search: "Zion National Park guided tour Springdale", stop: "Springdale · Zion" },
      { code: "5847LASWIN", search: "Grand Canyon helicopter Las Vegas", stop: "Las Vegas · Grand Canyon West" },
    ],
  },
  {
    slug: "california-icons-from-san-francisco",
    title: "California Icons Loop from San Francisco",
    gateway: { code: "SFO", name: "San Francisco International Airport" },
    gatewayCity: "San Francisco",
    region: "California",
    idealDays: "8–10 days",
    intro: "Land in San Francisco, drive inland to Yosemite and Lake Tahoe, taste your way through Napa Valley, then follow the coast at Monterey and Big Sur before returning the car at SFO.",
    audience: "Built for visitors from Europe and the UK who want granite valleys, alpine lakes, wine country and the Pacific coast in a single trip without a one-way drop fee.",
    stops: ["san-francisco", "yosemite", "lake-tahoe", "napa-valley", "monterey", "big-sur"],
    essentials: [
      ESTA, LICENCE,
      { title: "Yosemite reservations", text: "Yosemite has used peak-season entry reservations in recent years. Check the NPS Yosemite page for the current rules for your dates before you book hotels." },
      { title: "Tioga Pass is seasonal", text: "The high road between Yosemite and the eastern Sierra usually closes from November to late May or June. Outside summer, reach Lake Tahoe via Highway 50 or Interstate 80." },
      { title: "Big Sur road closures", text: "Landslides close sections of Highway 1 along Big Sur from time to time. Check Caltrans QuickMap the day you drive and plan an inland detour." },
      { title: "Wine tasting and driving", text: "California's limit is 0.08% blood alcohol. In Napa, book a tasting tour or choose a designated driver; most wineries need reservations." },
    ],
    faqs: [
      { q: "How many days do I need for a San Francisco, Yosemite and Lake Tahoe loop?", a: "Plan 8 to 10 days: two nights in San Francisco, two in Yosemite, two at Lake Tahoe, one in Napa and one or two on the Monterey–Big Sur coast." },
      { q: "Can I return the rental car at SFO?", a: "Yes. The loop ends back in San Francisco, so you can return the car where you picked it up and usually avoid one-way fees." },
      { q: "When is the best time to drive this loop?", a: "June to October gives the most open roads, including Tioga Pass. Spring has strong waterfalls in Yosemite; winter brings snow chains at Tahoe and Yosemite." },
    ],
    experiences: [
      { search: "Yosemite day tour from San Francisco", stop: "San Francisco · Yosemite" },
      { search: "Napa Valley wine tour", stop: "Napa Valley" },
      { search: "Monterey Bay whale watching", stop: "Monterey" },
    ],
    pilot: false,
  },
  {
    slug: "florida-keys-loop-from-miami",
    title: "Florida Tropical & Keys Loop from Miami",
    gateway: { code: "MIA", name: "Miami International Airport" },
    gatewayCity: "Miami",
    region: "Florida",
    idealDays: "6–8 days",
    intro: "Land in Miami, drive the Overseas Highway through Key Largo to Key West, cross the Everglades on the Tamiami Trail to Naples and return the car at MIA.",
    audience: "Built for visitors from Europe, the UK and Latin America who want beaches, coral reefs and wetland wildlife on a short, easy-driving loop.",
    stops: ["miami", "florida-keys", "key-west", "naples"],
    legNotes: {
      "florida-keys": "Key Largo is the first stop on the Overseas Highway — snorkel John Pennekamp Coral Reef State Park.",
      naples: "The drive follows the Tamiami Trail through Everglades National Park and Big Cypress; stop at Shark Valley or the Everglades City visitor area.",
    },
    essentials: [
      ESTA, LICENCE,
      { title: "Hurricane season", text: "Atlantic hurricane season runs June to November, peaking August to October. Buy flexible bookings and follow National Hurricane Center advisories." },
      { title: "Tolls are electronic", text: "Many Miami highways are cashless. Ask your rental company how tolls (SunPass) are billed so you are not surprised by admin fees." },
      { title: "Everglades park pass", text: "Everglades National Park charges a vehicle entry fee; the America the Beautiful pass covers it. Bring mosquito repellent in the wet season." },
      { title: "One road to Key West", text: "The Overseas Highway is a single two-lane road for long stretches. Allow 3.5–4 hours from Miami to Key West and avoid driving it after dark on Friday evenings." },
    ],
    faqs: [
      { q: "How many days do I need for Miami, Key West and the Everglades?", a: "Plan 6 to 8 days: two nights in Miami, one in Key Largo, two in Key West and one or two in Naples after crossing the Everglades." },
      { q: "Can I return the rental car in Miami?", a: "Yes. The loop returns to Miami, so you can drop the car at MIA and usually avoid one-way fees." },
      { q: "When is the best time to visit the Florida Keys?", a: "December to April is dry and mild. Summer is hot and humid with afternoon storms, and hurricane risk peaks from August to October." },
    ],
    experiences: [
      { search: "Everglades airboat tour Miami", stop: "Everglades" },
      { search: "Key West snorkeling tour", stop: "Key West" },
      { search: "Key Largo snorkel John Pennekamp", stop: "Key Largo" },
    ],
    pilot: false,
  },
  {
    slug: "pacific-northwest-from-seattle",
    title: "Pacific Northwest Loop from Seattle",
    gateway: { code: "SEA", name: "Seattle–Tacoma International Airport" },
    gatewayCity: "Seattle",
    region: "Washington",
    idealDays: "7–10 days",
    intro: "Land in Seattle, drive to the glaciers and wildflower meadows of Mount Rainier, continue to the rainforests and wild beaches of Olympic National Park and return the car at SEA.",
    audience: "Built for visitors from Asia, Europe and Australia who want mountains, temperate rainforest and Pacific coastline close to one major airport.",
    stops: ["seattle", "mount-rainier", "olympic"],
    essentials: [
      ESTA, LICENCE,
      { title: "Mount Rainier timed entry", text: "Mount Rainier has used summer timed-entry reservations for the Paradise and Sunrise corridors. Check the NPS page for your dates." },
      { title: "Ferries save time", text: "Washington State Ferries cross Puget Sound to the Olympic Peninsula. Reserve vehicle space on busy summer routes or allow extra waiting time." },
      { title: "Weather changes fast", text: "Rain is common outside July to September, and Sunrise and Hurricane Ridge roads can close for snow. Pack waterproof layers." },
      { title: "Large distances on the peninsula", text: "Olympic is a ring of separate areas around Highway 101. Base yourself in two places, such as Port Angeles and Forks or Lake Quinault." },
    ],
    faqs: [
      { q: "How many days do I need for Seattle, Mount Rainier and Olympic?", a: "Plan 7 to 10 days: two nights in Seattle, two at Mount Rainier and three or more on the Olympic Peninsula." },
      { q: "Can I return the rental car at Sea-Tac?", a: "Yes. The loop returns to Seattle, so you can return the car at SEA and usually avoid one-way fees." },
      { q: "When is the best time for this loop?", a: "July to September gives the driest weather and open high roads. Spring and autumn are quieter but wetter." },
    ],
    experiences: [
      { search: "Mount Rainier day tour from Seattle", stop: "Seattle · Mount Rainier" },
      { search: "Olympic National Park tour", stop: "Olympic" },
      { search: "Seattle city highlights tour", stop: "Seattle" },
    ],
    pilot: false,
  },
  {
    slug: "colorado-rockies-from-denver",
    title: "Colorado Rockies Loop from Denver",
    gateway: { code: "DEN", name: "Denver International Airport" },
    gatewayCity: "Denver",
    region: "Colorado · Utah",
    idealDays: "7–9 days",
    intro: "Land in Denver, climb Trail Ridge Road in Rocky Mountain National Park, cross the mountains to Aspen, drop into the red-rock canyons of Moab and Arches, then return the car at DEN.",
    audience: "Built for visitors who want high mountain scenery and desert canyons on one loop, with a gateway airport served by many international flights.",
    stops: ["denver", "rocky-mountain", "aspen", "moab"],
    essentials: [
      ESTA, LICENCE,
      { title: "Timed entry at two parks", text: "Rocky Mountain and Arches national parks have both used seasonal timed-entry reservations. Book each on Recreation.gov as soon as your dates are fixed." },
      { title: "Altitude", text: "Denver sits at 1,600 m and Trail Ridge Road passes 3,700 m. Drink plenty of water and take your first day easy." },
      { title: "Independence Pass is seasonal", text: "The direct road into Aspen usually closes from November to late May. Outside summer, use Interstate 70 via Glenwood Springs." },
      { title: "Desert heat in Moab", text: "Summer days in Moab often pass 38 °C. Hike early, carry water and fill up before the empty stretch back across Interstate 70." },
    ],
    faqs: [
      { q: "How many days do I need for Denver, Rocky Mountain and Moab?", a: "Plan 7 to 9 days: one night in Denver at each end, two at Rocky Mountain, one or two in Aspen and two in Moab for Arches and Canyonlands." },
      { q: "Can I return the rental car in Denver?", a: "Yes. The loop returns to Denver, so you can drop the car at DEN and usually avoid one-way fees." },
      { q: "When is the best time for this loop?", a: "Late June to September opens every mountain road. May and October are cooler in Moab but some high passes may be closed." },
    ],
    experiences: [
      { search: "Rocky Mountain National Park tour from Denver", stop: "Denver · Rocky Mountain" },
      { search: "Arches National Park tour Moab", stop: "Moab · Arches" },
      { search: "Moab off-road jeep tour", stop: "Moab" },
    ],
    pilot: false,
  },
  {
    slug: "arizona-red-rocks-from-phoenix",
    title: "Arizona Red Rocks Loop from Phoenix",
    gateway: { code: "PHX", name: "Phoenix Sky Harbor International Airport" },
    gatewayCity: "Phoenix",
    region: "Arizona",
    idealDays: "6–8 days",
    intro: "Land in Phoenix, drive north to the red rocks of Sedona, stand on the Grand Canyon's South Rim, see Antelope Canyon and Horseshoe Bend at Page, then return the car at PHX.",
    audience: "Built for visitors who want Arizona's desert and canyon highlights without starting in Las Vegas, on a compact loop with short driving days.",
    stops: ["phoenix", "sedona", "grand-canyon", "antelope-canyon", "horseshoe-bend"],
    essentials: [
      ESTA, LICENCE,
      { title: "Arizona time zone", text: "Most of Arizona does not observe daylight saving time, but the Navajo Nation around Page does. Re-check tour start times at Antelope Canyon." },
      { title: "Antelope Canyon is guided only", text: "Antelope Canyon can only be visited with a licensed Navajo tour operator. Book a time slot before you leave home." },
      { title: "Park pass", text: "The America the Beautiful pass covers Grand Canyon entry. Horseshoe Bend charges a separate city parking fee." },
      { title: "Heat and elevation", text: "Phoenix often passes 40 °C in summer while the South Rim at 2,100 m can be cold or snowy in winter. Pack for both." },
    ],
    faqs: [
      { q: "How many days do I need for Phoenix, Sedona, the Grand Canyon and Page?", a: "Plan 6 to 8 days: one night in Phoenix at each end, two in Sedona, two at the Grand Canyon and one or two in Page." },
      { q: "Can I return the rental car in Phoenix?", a: "Yes. The loop returns to Phoenix, so you can drop the car at PHX and usually avoid one-way fees." },
      { q: "When is the best time for this loop?", a: "March to May and October to November are the most comfortable. Summer is very hot in Phoenix; winter can bring snow at the Grand Canyon." },
    ],
    experiences: [
      { code: "142864P1", search: "Antelope Canyon tour Page Arizona", stop: "Page · Antelope Canyon" },
      { search: "Sedona pink jeep tour", stop: "Sedona" },
      { search: "Grand Canyon South Rim tour from Sedona", stop: "Grand Canyon" },
    ],
    pilot: false,
  },
  ...MORE_CORRIDORS,
];

export const getCorridor = (slug: string) => CORRIDORS.find((c) => c.slug === slug) ?? null;

const FIRST_WAVE_AREA: Record<string, string> = {
  "grand-circle-from-las-vegas": "Southwest", "arizona-red-rocks-from-phoenix": "Southwest",
  "california-icons-from-san-francisco": "West Coast", "pacific-northwest-from-seattle": "West Coast",
  "colorado-rockies-from-denver": "Rocky Mountains", "florida-keys-loop-from-miami": "Southeast",
};
export const CORRIDOR_AREAS = ["West Coast", "Southwest", "Rocky Mountains", "Southeast", "Northeast", "Midwest, Texas & Alaska"];
export const corridorArea = (c: Corridor) => c.area ?? FIRST_WAVE_AREA[c.slug] ?? "More loops";
