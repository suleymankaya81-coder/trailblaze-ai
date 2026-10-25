import { createFileRoute, Link } from "@tanstack/react-router";

import { StaticPageLayout } from "@/components/site/StaticPageLayout";

export const Route = createFileRoute("/affiliate-disclosure")({
  head: () => ({
    meta: [
      { title: "Affiliate Disclosure — MiniaLife" },
      {
        name: "description",
        content:
          "How MiniaLife makes money: affiliate commissions on bookings and gear purchases, at no extra cost to you.",
      },
      { property: "og:url", content: "https://minialife.com/affiliate-disclosure" },
      { property: "og:title", content: "Affiliate Disclosure — MiniaLife" },
      { property: "og:description", content: "How MiniaLife earns commissions through partner links without adding to your booking price." },
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
      lede="MiniaLife may earn a commission when you book or purchase through links on this site, at no extra cost to you."
      updated="October 25, 2026"
    >
      <section>
        <h2>How this works</h2>
        <p>
          MiniaLife currently earns commissions through Harvest Hosts and RoverPass
          (via Awin), Vrbo and Expedia
          (via the Expedia Group Travel Creator Program), and travel brands available through
          Travelpayouts: Aviasales, Klook, Tiqets, Go City,
          EKTA, Airalo, Radical Storage, and through the Webjet Group programme, Motorhome Republic and Airport Rentals. When you click one of these partner links and go on to book or
          purchase, we may earn a small commission. Affiliate links are tracked by
          the network on the partner's behalf.
        </p>
        <p>
          We also use direct Viator partner links and ROCKBROS product links through Awin.
        </p>
        <p>
          Some buttons — for example REI gear — are ordinary direct links to
          brands we are not paid by. We earn nothing from them.
        </p>
        <p>
          This commission is paid by the partner out of their own marketing budget. It does not
          change the price you pay, and it is never added to a listing to make it more expensive.
        </p>
      </section>

      <section>
        <h2>Where to find this disclosure</h2>
        <p>
          The Affiliate Disclosure link in the site footer opens this explanation of our
          partnerships. Booking and shopping buttons identify the provider they open. Outbound
          links open in a new tab; affiliate tracking may record a referral when you click.
        </p>
        <p>
          Prices and availability shown on MiniaLife are estimates gathered at the time of
          research. The partner's own site is always the source of truth for current pricing,
          availability, and cancellation terms.
        </p>
        <p>
          For a plain-English overview of what paid-for advertising on websites means, see{" "}
          <a
            href="https://paidforadvertising.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            paidforadvertising.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Why we do this</h2>
        <p>
          Affiliate commissions are how MiniaLife stays free to use. They let us keep researching
          destinations, comparing travel options, and writing route guides without charging you a
          subscription or gating content behind a paywall.
        </p>
      </section>

      <section>
        <h2>Our editorial standards</h2>
        <p>
          Recommendations on MiniaLife are based on our own research into location, reviews, and
          fit for the trip type we're covering — not on which partner pays the highest commission.
          Whether a stay, rental, or activity earns us a commission has no bearing on whether it
          appears on the site or how it's described. If a link isn't yet bookable, the button says
          so ("Coming soon") instead of sending you somewhere broken.
        </p>
      </section>

      <section>
        <h2>Where you'll see affiliate links</h2>
        <p>
          Affiliate links appear alongside flights, vehicle rentals, stays, tours and Curated Trip Essentials on travel pages. Outbound links open in a new tab so
          you never lose your place on MiniaLife.
        </p>
      </section>

      <section>
        <h2>Questions</h2>
        <p>
          If you have questions about a specific link or partnership, reach out on our{" "}
          <Link to="/contact">Contact</Link> page.
        </p>
      </section>
    </StaticPageLayout>
  );
}
