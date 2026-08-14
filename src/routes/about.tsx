import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, MapPin, Sparkles, Tent } from "lucide-react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Minialife" },
      {
        name: "description",
        content:
          "Minialife is a destination-first outdoor travel guide — where to stay, what to rent, what to do, and what to pack, in one place.",
      },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  {
    icon: Compass,
    title: "One destination, one plan",
    body: "Pick a park or a trip idea and get a complete guide back — stays, rentals, activities, packing, and budget — instead of twenty browser tabs.",
  },
  {
    icon: Tent,
    title: "Curated, not exhaustive",
    body: "We'd rather show you four stays worth booking than forty you have to sort through. Every listing is chosen for fit — location, season, and trip type — not just for being available.",
  },
  {
    icon: MapPin,
    title: "Built for the outdoors",
    body: "Camping, glamping, RV and campervan travel, cabins, tiny houses, and national park road trips. If it involves a tent, a trailhead, or a trunk full of gear, it's in scope.",
  },
  {
    icon: Sparkles,
    title: "AI where it earns its keep",
    body: "AI fills in the details that change fast — weather patterns, crowd levels, packing lists — on top of a destination template we research and fact-check ourselves. It never invents the core facts.",
  },
];

function AboutPage() {
  return (
    <div className="bg-beige/30">
      <Header />

      <main className="container-page py-12">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-deep">
            About Minialife
          </p>
          <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
            A trip guide for people who'd rather be outside.
          </h1>
          <p className="mt-5 text-base text-muted-foreground">
            Minialife is a destination-planning site for camping, glamping, RV travel, cabins, and
            national parks across the United States. Tell us where you want to go — or what kind
            of trip you're after — and we put together where to stay, what to rent, what to do,
            and what to pack, all in one page.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <p.icon className="h-5 w-5 text-forest" />
              <h2 className="mt-3 font-display text-lg text-foreground">{p.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-soft md:p-10">
          <div className="space-y-6 text-sm leading-relaxed text-foreground/80">
            <section>
              <h2 className="mb-2 font-display text-xl text-foreground">Who this is for</h2>
              <p>
                First-time campers who want a plan instead of a spreadsheet, RV travelers stringing
                together a multi-park route, and anyone who's decided "we should do a national
                park trip this year" and needs somewhere to start. If you're picking between a
                tent, a rental RV, and a cabin for the same weekend, Minialife is built for that
                exact decision.
              </p>
            </section>
            <section>
              <h2 className="mb-2 font-display text-xl text-foreground">What we don't do</h2>
              <p>
                We don't process bookings or payments — every "Check availability," "Reserve," or
                "Buy" button sends you to the actual campground, rental marketplace, or retailer to
                finish there. We also don't accept payment to rank a listing higher; see our{" "}
                <Link to="/affiliate-disclosure" className="text-forest underline underline-offset-2">
                  Affiliate Disclosure
                </Link>{" "}
                for how the site makes money.
              </p>
            </section>
            <section>
              <h2 className="mb-2 font-display text-xl text-foreground">Who publishes Minialife</h2>
              <p>
                Minialife is an independent outdoor-travel publisher, run by a small editorial team
                based in the United States. We write and edit every destination guide ourselves and
                are solely responsible for the content on this site. Editorial questions, corrections,
                and partner or affiliate-network enquiries all reach us at{" "}
                <a href="mailto:hello@minialife.com" className="text-forest underline underline-offset-2">
                  hello@minialife.com
                </a>
                ; we reply within a few business days.
              </p>
            </section>
            <section>
              <h2 className="mb-2 font-display text-xl text-foreground">Get in touch</h2>
              <p>
                Found a broken link, a wrong detail, or have a destination you'd like to see
                covered? We'd like to hear it —{" "}
                <Link to="/contact" className="text-forest underline underline-offset-2">
                  contact us
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
