import { createFileRoute, Link } from "@tanstack/react-router";

import { StaticPageLayout } from "@/components/site/StaticPageLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — MiniaLife" },
      {
        name: "description",
        content:
          "How MiniaLife collects, uses, and protects your information — including analytics and click tracking on affiliate links.",
      },
      { property: "og:url", content: "https://minialife.com/privacy" },
      { property: "og:title", content: "Privacy Policy — MiniaLife" },
      { property: "og:description", content: "How MiniaLife handles your information, analytics and partner-link tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://minialife.com/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      lede="This policy explains what information MiniaLife collects when you use the site, how we use it, and the choices you have."
      updated="October 24, 2026"
    >
      <section>
        <h2>Overview</h2>
        <p>
          MiniaLife ("we," "us," or "our") operates minialife.com and related pages (the "Site").
          This policy applies to visitors of the Site. By using the Site, you agree to the
          collection and use of information as described here.
        </p>
      </section>

      <section>
        <h2>Information we collect</h2>
        <p>We keep data collection minimal. The Site does not require an account to use, and we
          do not collect names, mailing addresses, or payment details — bookings and purchases
          happen entirely on our partners' sites, not on MiniaLife.</p>
        <ul>
          <li>
            <strong>Usage analytics.</strong> Standard, aggregated analytics (pages viewed,
            approximate location by IP, device/browser type, referring site) to understand how
            the Site is used and to improve it.
          </li>
          <li>
            <strong>Click tracking on outbound links.</strong> When you click a "Check
            availability," "Reserve," or "Buy" link to one of our partners, we record which offer
            was clicked, the destination page it appeared on, a randomly generated session
            identifier, a timestamp, and the page you clicked from. This tells us which
            recommendations are useful and lets our partners credit us for the referral.
          </li>
          <li>
            <strong>Local storage.</strong> We store a randomly generated session identifier in
            your browser's local storage so repeat clicks during a visit can be grouped together.
            This identifier is not tied to your name, email, or any other personal information.
          </li>
          <li>
            <strong>Contact form.</strong> If you use the <Link to="/contact">Contact</Link> page,
            the form prepares a message in your own email app. The Site does not submit or store
            those form details. We receive your name, email address and message only if you send
            that email to us, so we can respond.
          </li>
        </ul>
      </section>

      <section>
        <h2>How we use information</h2>
        <ul>
          <li>To operate, maintain, and improve the Site and its recommendations.</li>
          <li>To measure which destinations, stays, and rentals visitors find useful.</li>
          <li>To attribute bookings and purchases to MiniaLife for affiliate commission purposes — see our <Link to="/affiliate-disclosure">Affiliate Disclosure</Link>.</li>
          <li>To respond to messages sent through the Contact page.</li>
        </ul>
      </section>

      <section>
        <h2>We do not sell your data</h2>
        <p>
          MiniaLife does not sell, rent, or trade personal information to third parties for their
          own marketing purposes. Information about outbound clicks is shared only with the
          specific partner you clicked through to, and only as needed for them to credit the
          referral and, where applicable, fulfill your booking or order.
        </p>
      </section>

      <section>
        <h2>Third-party links and partners</h2>
        <p>
          The Site links to third-party booking and retail partners (such as Motorhome Republic, Hipcamp,
          Glamping Hub, Arrive Outdoors, REI, and Viator). Some of these links are managed through
          affiliate networks, including Awin, which may receive the click and referral
          information described above in order to attribute a referral and pay a commission. Once you leave MiniaLife, that partner's
          own privacy policy governs how they handle your information. We encourage you to review
          it before booking or purchasing.
        </p>
      </section>

      <section>
        <h2>Cookies and similar technologies</h2>
        <p>
          We use local storage (not third-party advertising cookies) to maintain a session
          identifier for click attribution. You can clear this at any time through your browser's
          settings; doing so simply starts a new session the next time you click an outbound link.
        </p>
      </section>

      <section>
        <h2>Data retention</h2>
        <p>
          Click-tracking records are retained only as long as needed to measure recommendation
          performance and reconcile affiliate commissions, after which they are deleted or
          aggregated.
        </p>
      </section>

      <section>
        <h2>Children's privacy</h2>
        <p>
          The Site is not directed at children under 16, and we do not knowingly collect
          information from children under 16. Our content and partner links are intended for
          adults planning their own travel.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can use most of the Site without providing any personal information. You can opt out
          of click attribution at any time by clearing your browser's local storage or by contacting
          us to request deletion of records tied to your session identifier. If you've
          contacted us and want your message or details removed, reach out through the{" "}
          <Link to="/contact">Contact</Link> page and we'll take care of it.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          We may update this policy as the Site changes. The "Last updated" date at the top of
          this page reflects the most recent revision.
        </p>
      </section>

      <section>
        <h2>Contact us</h2>
        <p>
          Questions about this policy? Visit our <Link to="/contact">Contact</Link> page.
        </p>
      </section>
    </StaticPageLayout>
  );
}
