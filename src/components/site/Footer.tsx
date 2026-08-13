import { Link } from "@tanstack/react-router";
import { Mountain } from "lucide-react";

const footerLinks = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/affiliate-disclosure", label: "Affiliate Disclosure" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Use" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-beige/50">
      <div className="container-page py-16">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <Mountain className="h-5 w-5" />
            <span className="font-display text-xl">Minialife</span>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            A modern outdoor-travel guide. Tell us where you want to go and we'll show you where to
            stay, what to rent, what to do, and what to bring.
          </p>
        </div>

        <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-sm text-foreground/80">
          {footerLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-forest hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} Minialife. All rights reserved.</span>
          <span>Crafted for the great outdoors.</span>
        </div>
      </div>
    </footer>
  );
}
