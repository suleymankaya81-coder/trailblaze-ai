// Query-specific FAQs for search pages, built only from stored data — never per-visit AI.
// Each page type answers the questions people search alongside that page's keyword;
// a question is skipped when its data is missing.
import { formatDriveShort, type Faq } from "@/lib/seo/flyDrive";

export type LandingFaqFacts = {
  bestSeason: string | null;
  tripDays: string | null;
  airport: string | null;
  driveMinutes: number | null;
  permitLevel: string | null;
  dailyBudget: number | null;
};

type Section = { heading: string };

const airportLine = (f: LandingFaqFacts) =>
  f.airport ? `${f.airport}${f.driveMinutes != null ? `, about ${formatDriveShort(f.driveMinutes)} away by car` : ""}` : null;

export function landingFaqs(pageType: string, name: string, f: LandingFaqFacts, sections: Section[] = []): Faq[] {
  const faqs: Faq[] = [];
  const air = airportLine(f);
  const budget = f.dailyBudget != null ? `about $${f.dailyBudget} per person per day, excluding flights (a typical estimate; prices vary by season)` : null;
  const reservations =
    f.permitLevel === "high" ? `Yes — ${name} can require an advance reservation or permit for at least part of the year. Check the official site before you go.`
    : f.permitLevel === "moderate" ? `Not always, but booking ahead is recommended for ${name}, especially in peak season.`
    : f.permitLevel === "low" ? `No general entry reservation is usually needed for ${name}; popular tours and stays can still sell out.`
    : null;
  const headings = sections.map((s) => s.heading.replace(/^\d+[.)]\s*/, "")).filter(Boolean).slice(0, 4);

  switch (pageType) {
    case "best_time":
      if (f.bestSeason) faqs.push({ q: `What month is best to visit ${name}?`, a: `Most visitors find ${f.bestSeason} the best window for ${name}, with the most reliable weather and access.` });
      if (f.bestSeason) faqs.push({ q: `When should you avoid visiting ${name}?`, a: `Outside ${f.bestSeason}, weather and seasonal closures can limit roads, trails and services. Check current conditions before booking.` });
      if (reservations) faqs.push({ q: `Do you need to book ${name} in advance?`, a: reservations });
      break;
    case "things_to_do":
      if (headings.length >= 2) faqs.push({ q: `What are the top things to do in ${name}?`, a: `Highlights include ${headings.join(", ")}.` });
      if (f.tripDays) faqs.push({ q: `How much time do you need to see ${name}?`, a: `Plan ${f.tripDays} to cover the main sights at a comfortable pace.` });
      if (f.bestSeason) faqs.push({ q: `When is the best time for activities in ${name}?`, a: `${f.bestSeason} usually offers the widest choice of open activities and tours.` });
      break;
    case "trip_planner":
      if (f.tripDays) faqs.push({ q: `How many days should a ${name} itinerary be?`, a: `A ${f.tripDays} itinerary covers the main sights without rushing.` });
      if (air) faqs.push({ q: `Which airport should you fly into for ${name}?`, a: `The closest airport is ${air}.` });
      if (budget) faqs.push({ q: `How much does a ${name} trip cost?`, a: `Budget ${budget}.` });
      break;
    case "glamping":
      if (f.bestSeason) faqs.push({ q: `When is the best time to go glamping near ${name}?`, a: `${f.bestSeason} offers the most comfortable glamping weather near ${name}.` });
      if (air) faqs.push({ q: `How do you get to glamping near ${name}?`, a: `Fly into ${air}, then drive — most sites need a car.` });
      faqs.push({ q: `Do glamping sites near ${name} sell out?`, a: `Yes, popular sites often book out months ahead in peak season, so reserve early.` });
      break;
  }
  return faqs;
}
