import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare } from "lucide-react";
import { useState } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CONTACT_EMAIL = "hello@minialife.com";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Minialife" },
      {
        name: "description",
        content: "Get in touch with the Minialife team — broken links, destination requests, or partnership questions.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const mailtoHref = (() => {
    const subject = encodeURIComponent(`Message from ${name || "the Minialife site"}`);
    const bodyLines = [message, "", email ? `Reply to: ${email}` : ""].filter(Boolean);
    const body = encodeURIComponent(bodyLines.join("\n"));
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  })();

  return (
    <div className="bg-beige/30">
      <Header />

      <main className="container-page py-12">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-deep">
            Get in touch
          </p>
          <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Contact</h1>
          <p className="mt-4 text-base text-muted-foreground">
            Found a broken link, a listing that's out of date, or a destination you'd like to see
            covered? We read everything that comes in.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:border-forest/40"
            >
              <Mail className="mt-0.5 h-5 w-5 text-forest" />
              <div>
                <p className="text-sm font-semibold text-foreground">Email us</p>
                <p className="mt-1 text-sm text-muted-foreground">{CONTACT_EMAIL}</p>
              </div>
            </a>
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <MessageSquare className="mt-0.5 h-5 w-5 text-forest" />
              <div>
                <p className="text-sm font-semibold text-foreground">Response time</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We reply within a few business days — and within one business day for partner,
                  merchant, or affiliate-network enquiries.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Minialife is an independent outdoor-travel publisher based in the United States.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = mailtoHref;
            }}
            className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8"
          >
            <p className="text-sm text-muted-foreground">
              Fill this out and it'll open a pre-filled email in your mail app — Minialife doesn't
              have a support inbox behind this form, just a direct line to {CONTACT_EMAIL}.
            </p>
            <div className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="contact-name">Name</Label>
                <Input
                  id="contact-name"
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={5}
                />
              </div>
            </div>
            <Button type="submit" className="mt-6 w-full">
              Open email to send
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
