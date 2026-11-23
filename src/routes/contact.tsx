import { SITE_ORIGIN } from "@/config/site";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Thumb } from "@/components/ui-kit";
import planImage from "@/assets/thumbs/plan.jpg";
import roadImage from "@/assets/thumbs/road.jpg";
import { CONTACT_EMAIL, contactSchema } from "@/lib/contact";
import { submitContactMessage } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — WildParkRoutes" },
      {
        name: "description",
        content: "Get in touch with the WildParkRoutes team — broken links, destination requests, or partnership questions.",
      },
      { property: "og:url", content: `${SITE_ORIGIN}/contact` },
      { property: "og:title", content: "Contact — WildParkRoutes" },
      { property: "og:description", content: "Contact WildParkRoutes about destination requests, broken links or partnerships." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `${SITE_ORIGIN}/contact` }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <div className="bg-background">
      <Header />

      <main className="container-page py-12">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-deep">
            Get in touch
          </p>
          <h1 className="mt-3 font-display text-[34px] leading-tight text-foreground md:text-[56px]">Contact</h1>
          <p className="mt-4 text-base text-muted-foreground">
            Found a broken link, a listing that's out of date, or a destination you'd like to see
            covered? We read everything that comes in.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-start gap-3 border-b border-border py-6 transition hover:opacity-80"
            >
              <Thumb src={planImage} size={48} />
              <div>
                <p className="text-sm font-semibold text-foreground">Email us</p>
                <p className="mt-1 text-sm text-muted-foreground">{CONTACT_EMAIL}</p>
              </div>
            </a>
            <div className="flex items-start gap-3 py-6">
              <Thumb src={roadImage} size={48} />
              <div>
                <p className="text-sm font-semibold text-foreground">Response time</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We reply within a few business days — and within one business day for partner,
                  merchant, or affiliate-network enquiries.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  WildParkRoutes is an independent outdoor-travel publisher based in the United States.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const result = contactSchema.safeParse({ name, email, message });
              if (!result.success) {
                setError(result.error.issues[0]?.message ?? "Check your details.");
                setSent(false);
                return;
              }
              setError("");
              setSending(true);
              try {
                await submitContactMessage({ data: result.data });
                setSent(true);
                setName("");
                setEmail("");
                setMessage("");
              } catch {
                setError("Could not send your message. Please try again or email us directly.");
              } finally {
                setSending(false);
              }
            }}
            className="rounded-lg border border-border bg-card p-6 md:p-8"
          >
            <p className="text-sm text-muted-foreground">
              Your message goes straight to our inbox at {CONTACT_EMAIL} — we read everything.
            </p>
            <div className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="contact-name">Name</Label>
                <Input
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  maxLength={255}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  name="message"
                  required
                  maxLength={2000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={5}
                />
              </div>
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
            {sent && <p role="status" className="mt-4 text-sm text-muted-foreground">Thanks — your message has been sent. We reply within a few business days.</p>}
            <Button type="submit" disabled={sending} className="mt-6 min-h-12 w-full">
              {sending ? "Sending…" : "Send message"}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
