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
};

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
    pilot: true,
  },
];

export const getCorridor = (slug: string) => CORRIDORS.find((c) => c.slug === slug) ?? null;
