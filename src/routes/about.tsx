import { T } from "@/lib/i18n";
import { deAlternates } from "@/lib/i18n/deTemplate";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/components/site/LocalLink";
import { StaticPageLayout } from "@/components/site/StaticPageLayout";
import { Thumb } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import mapImage from "@/assets/thumbs/map.jpg";
import planImage from "@/assets/thumbs/plan.jpg";
import carImage from "@/assets/thumbs/car.jpg";

const description = "MiniaLife publishes free U.S. outdoor travel guides and self-drive itineraries. Plan a route, check arrival and entry notes, then book with travel partners.";
export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About MiniaLife — Outdoor Travel & Road Trip Guides" },
      { name: "description", content: description },
      { property: "og:title", content: "About MiniaLife — Outdoor Travel & Road Trip Guides" },
      { property: "og:description", content: description },
      { property: "og:url", content: "https://minialife.com/about" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://minialife.com/about" }, ...deAlternates("https://minialife.com/about")],
  }),
  component: AboutPage,
});
const steps = [
  { image: mapImage, title: "Choose a park or route", text: "Start with an outdoor destination, a multi-park loop or a road trip from your arrival airport." },
  { image: planImage, title: "Bring the plan together", text: "See suggested days, route maps, airport drives, reservation notes and places to stay." },
  { image: carImage, title: "Book with the partner", text: "Compare your options, then confirm dates, meeting points, final prices and terms on the provider’s site." },
];
export function AboutPage() {
  return <StaticPageLayout eyebrow="About MiniaLife" title="Outdoor travel, one route at a time." lede="Free U.S. outdoor travel guides and self-drive itineraries — for people who would rather be outside.">
    <section>
      <h2><T>Your place, your pace</T></h2>
      <p><T>MiniaLife brings national parks, scenic towns and road-trip stops into one planning experience. Use our day-by-day suggestions, maps and arrival guidance to shape your own trip, whether you travel by car, campervan or RV.</T></p>
      <p><T>We are an independent travel publisher, not a tour operator or booking agency. Our guides are free to use; bookings and purchases happen on our partners’ sites.</T></p>
      <Button asChild className="mt-6 min-h-12"><Link to="/destinations"><T>Find your destination</T></Link></Button>
    </section>
    <section>
      <h2>How it works</h2>
      <ol className="mt-6 space-y-6">
        {steps.map((step, index) => <li key={step.title} className="flex gap-4 border-b border-border pb-6">
          <Thumb src={step.image} size={72} />
          <div><p className="text-xs font-semibold text-sage-deep">Step {index + 1}</p><h3 className="mt-1 text-xl text-foreground">{step.title}</h3><p className="mt-2 text-sm">{step.text}</p></div>
        </li>)}
      </ol>
    </section>
    <section>
      <h2>Independent guidance, clear limits</h2>
      <p><T>Our itineraries are suggestions, not packaged tours. Some planning content is assisted by AI and reviewed through our editorial process; this does not mean every statement or map marker has been independently verified. Park access, road conditions, seasonal services and partner prices can change. Check official sources and the provider before you travel.</T></p>
      <p><T>Service photographs may illustrate a type of stay or vehicle rather than bookable inventory. Rental and stay price anchors are labelled estimates. Actual tour listings, photos, prices and ratings come from Viator and are confirmed on Viator.</T></p>
    </section>
    <section>
      <h2><T>Curated Trip Essentials</T></h2>
      <p><T>Optional equipment suggestions support the route and its activities. They are not a complete packing or safety list, and MiniaLife does not operate a retail store.</T></p>
    </section>
    <section>
      <h2>Who publishes MiniaLife</h2>
      <p><T>MiniaLife is an independent outdoor-travel publisher. For editorial questions, corrections or partnership enquiries,</T> <Link to="/contact">contact us</Link>.</p>
    </section>
  </StaticPageLayout>;
}
