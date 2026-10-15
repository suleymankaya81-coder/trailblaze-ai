import { createFileRoute, Link } from "@tanstack/react-router";

import { StaticPageLayout } from "@/components/site/StaticPageLayout";

export const Route = createFileRoute("/affiliate-disclosure")({
  head: () => ({
    meta: [
      { title: "Affiliate Disclosure — Minialife" },
      {
        name: "description",
        content:
          "How Minialife makes money: affiliate commissions on bookings and gear purchases, at no extra cost to you.",
      },
      { property: "og:url", content: "https://minialife.com/affiliate-disclosure" },
      { property: "og:title", content: "Affiliate Disclosure — Minialife" },
      { property: "og:description", content: "How Minialife earns commissions through partner links without adding to your booking price." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://minialife.com/affiliate-disclosure" }],
  }),
  component: AffiliateDisclosurePage,
});

function AffiliateDisclosurePage() {
  return (
    <StaticPageLayout
      eyebrow="Transparency"
      title="Affiliate Disclosure"
      lede="Minialife may earn a commission when you book or purchase through links on this site, at no extra cost to you."
      updated="August 13, 2026"
    >
      <section>
        <h2>How this works</h2>
        <p>
          Minialife currently earns commissions through Harvest Hosts (via Awin), Vrbo and Expedia
          (via the Expedia Group Travel Creator Program), and travel brands available through
          Travelpayouts: Aviasales, EconomyBookings, QEEQ, BikesBooking, Klook, Tiqets, Go City,
          EKTA, Airalo and Radical Storage. When you click one of these partner links and go on to book or
          purchase, we may earn a small commission. Links marked as partner links are tracked by
          the network on the partner's behalf.
        </p>
        <p>
          Some buttons — for example RVshare rentals and REI gear — are ordinary direct links to
          brands we are not paid by. They are labelled so you can tell the difference, and we earn
          nothing from them.
        </p>
        <p>
          This commission is paid by the partner out of their own marketing budget. It does not
          change the price you pay, and it is never added to a listing to make it more expensive.
        </p>
      </section>

      <section>
        <h2>How partner links are labelled</h2>
        <p>
          Every page that contains partner links carries a visible notice at the top, and each
          outbound button is labelled with the partner it opens (for example "Partner link ·
          Hipcamp"). Links open in a new tab and are marked as sponsored for search engines. We
          never hide, cloak, or redirect a link through a page that disguises where you are going,
          and clicks are only recorded when you actively click a button yourself.
        </p>
        <p>
          Prices and availability shown on Minialife are estimates gathered at the time of
          research. The partner's own site is always the source of truth for current pricing,
          availability, and cancellation terms.
        </p>
      </section>

      <section>
        <h2>Why we do this</h2>
        <p>
          Affiliate commissions are how Minialife stays free to use. They let us keep researching
          destinations, testing stays, and writing packing guides without charging you a
          subscription or gating content behind a paywall.
        </p>
      </section>

      <section>
        <h2>Our editorial standards</h2>
        <p>
          Recommendations on Minialife are based on our own research into location, reviews, and
          fit for the trip type we're covering — not on which partner pays the highest commission.
          Whether a stay, rental, or activity earns us a commission has no bearing on whether it
          appears on the site or how it's described. If a link isn't yet bookable, the button says
          so ("Coming soon") instead of sending you somewhere broken.
        </p>
      </section>

      <section>
        <h2>Where you'll see affiliate links</h2>
        <p>
          Affiliate links mainly appear in the "Top Stays," "Rent Before You Go," "Things to Do,"
          and "Essentials" sections of each destination page. Outbound links open in a new tab so
          you never lose your place on Minialife.
        </p>
      </section>

      <section>
        <h2>Questions</h2>
        <p>
          This disclosure follows FTC guidance on affiliate marketing (16 CFR Part 255). If you
          have questions about a specific link or partnership, reach out on our{" "}
          <Link to="/contact">Contact</Link> page.
        </p>
      </section>
    </StaticPageLayout>
  );
}
