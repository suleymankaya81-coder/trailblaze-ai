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
    ],
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
          Minialife partners with campgrounds, RV and gear rental marketplaces, outdoor retailers,
          and tour operators (including RVshare, Hipcamp, Glamping Hub, Arrive Outdoors, REI, and
          Viator). When you click a "Check availability," "Reserve," or "Buy" link on this site and
          go on to book or purchase with one of these partners, we may earn a small commission.
        </p>
        <p>
          This commission is paid by the partner out of their own marketing budget. It does not
          change the price you pay, and it is never added to a listing to make it more expensive.
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
