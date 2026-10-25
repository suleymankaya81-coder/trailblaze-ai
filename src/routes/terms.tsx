import { createFileRoute, Link } from "@tanstack/react-router";

import { StaticPageLayout } from "@/components/site/StaticPageLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — MiniaLife" },
      {
        name: "description",
        content: "The terms that govern your use of MiniaLife's destination guides and outbound booking links.",
      },
      { property: "og:url", content: "https://minialife.com/terms" },
      { property: "og:title", content: "Terms of Use — MiniaLife" },
      { property: "og:description", content: "The terms for using MiniaLife outdoor guides and partner booking links." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://minialife.com/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="Terms of Use"
      lede="Please read these terms before using MiniaLife. By browsing or using the Site, you agree to them."
      updated="October 24, 2026"
    >
      <section>
        <h2>Acceptance of terms</h2>
        <p>
          These Terms of Use ("Terms") govern your access to and use of minialife.com and related
          pages (the "Site"), operated by MiniaLife ("we," "us," or "our"). By using the Site, you
          agree to be bound by these Terms. If you do not agree, please do not use the Site.
        </p>
      </section>

      <section>
        <h2>What MiniaLife is</h2>
        <p>
          MiniaLife is a destination-planning guide. We publish curated information about
          national parks and outdoor destinations, including recommended stays, RV and gear
          rentals, activities, and curated trip essentials. We link out to third-party partners where
          you can book or purchase — MiniaLife itself does not process bookings, payments, or
          reservations.
        </p>
      </section>

      <section>
        <h2>Use of the Site</h2>
        <p>You agree to use the Site only for lawful purposes and in a way that doesn't infringe
          the rights of, or restrict or inhibit the use and enjoyment of, the Site by anyone else.
          You agree not to:</p>
        <ul>
          <li>Scrape, harvest, or systematically extract content from the Site without permission.</li>
          <li>Attempt to interfere with, disrupt, or gain unauthorized access to the Site or its underlying systems.</li>
          <li>Use the Site to distribute malware, spam, or unlawful content.</li>
          <li>Misrepresent your affiliation with MiniaLife.</li>
        </ul>
      </section>

      <section>
        <h2>Third-party bookings and purchases</h2>
        <p>
          Links on the Site take you to third-party partners (such as Motorhome Republic, Airport Rentals, Expedia, Vrbo, REI, ROCKBROS, and Viator) to complete a booking or purchase. Any transaction
          you enter into with a partner is solely between you and that partner, governed by their
          own terms, pricing, cancellation policies, and privacy practices. MiniaLife is not a
          party to those transactions and is not responsible for a partner's availability,
          pricing accuracy, service quality, or fulfillment. As described in our{" "}
          <Link to="/affiliate-disclosure">Affiliate Disclosure</Link>, we may earn a commission
          on qualifying bookings and purchases, at no extra cost to you.
        </p>
      </section>

      <section>
        <h2>Content accuracy</h2>
        <p>
          We aim to keep destination information, seasonal guidance, pricing estimates, and
          activity guidance accurate and current, but outdoor conditions, park rules, and
          partner pricing change. Always confirm details (permits, road closures, weather, and
          exact pricing) directly with the relevant park authority or booking partner before you
          travel.
        </p>
      </section>

      <section>
        <h2>Intellectual property</h2>
        <p>
          The Site's design, text, and original content are owned by MiniaLife or its licensors
          and protected by copyright and other intellectual property laws. You may view and share
          pages for personal, non-commercial use, but you may not reproduce, redistribute, or
          create derivative works from the Site's content without our permission.
        </p>
      </section>

      <section>
        <h2>Disclaimer of warranties</h2>
        <p>
          The Site and its content are provided "as is" and "as available," without warranties of
          any kind, express or implied. We do not warrant that the Site will be uninterrupted,
          error-free, or that recommendations will suit your particular trip or circumstances.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, MiniaLife will not be liable for any indirect,
          incidental, special, or consequential damages arising from your use of the Site or any
          third-party booking made through a link on the Site, including but not limited to lost
          bookings, travel costs, or trip disruptions.
        </p>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>
          We may update these Terms from time to time. The "Last updated" date at the top of this
          page reflects the most recent revision. Continued use of the Site after changes take
          effect constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p>
          These Terms are governed by the laws of the United States, without regard to conflict of
          law principles.
        </p>
      </section>

      <section>
        <h2>Contact us</h2>
        <p>
          Questions about these Terms? Visit our <Link to="/contact">Contact</Link> page.
        </p>
      </section>
    </StaticPageLayout>
  );
}
