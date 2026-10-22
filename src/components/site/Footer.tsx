import { Link } from "@tanstack/react-router";
import logoStacked from "@/assets/logos/minialife-stacked-mixedcase-trimmed.png";

const groups = [
  { title: "Road Trips", links: [
    { to: "/road-trips", label: "Road Trip Loops" },
    { to: "/corridors", label: "Gateway Road Trips" },
    { to: "/destinations", label: "All Destinations" },
  ] },
  { title: "Trip Guides", links: [
    { to: "/trip-guides", label: "All Trip Guides" },
    { to: "/fly-and-drive", label: "Fly & Drive" },
    { to: "/rv-camping", label: "RV & Camping" },
    { to: "/no-reservation", label: "No Reservation" },
  ] },
  { title: "Trip Essentials", links: [
    { to: "/gear", label: "Gear Shop" },
    { to: "/gear/7-bikepacking-essentials", label: "Bikepacking Essentials" },
    { to: "/gear/best-cycling-accessories", label: "Cycling Accessories" },
    { to: "/gear/bike-repair-kit-essentials", label: "Bike Repair Kit" },
  ] },
  { title: "MiniaLife", links: [
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    { to: "/affiliate-disclosure", label: "Affiliate Disclosure" },
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Use" },
  ] },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-beige/50">
      <div className="container-page py-16">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <div>
            <img
              src={logoStacked}
              alt="MiniaLife"
              width={598}
              height={737}
              className="h-24 w-auto"
            />
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            A modern outdoor-travel guide. Tell us where you want to go and we'll show you where to
            stay, what to rent, what to do, and what to bring.
          </p>
        </div>

        <nav className="mt-10 grid grid-cols-2 gap-8 border-t border-border pt-8 text-sm md:grid-cols-4">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{g.title}</p>
              <ul className="mt-3 space-y-2">
                {g.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-foreground/80 hover:text-forest hover:underline">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <p className="mt-6 text-xs text-muted-foreground">
          Minialife contains partner links. If you book or buy through them we may earn a
          commission, at no extra cost to you — see our{" "}
          <Link to="/affiliate-disclosure" className="font-semibold text-forest underline underline-offset-2">
            Affiliate Disclosure
          </Link>
          . Minialife is an independent publisher and does not process bookings or payments.
        </p>

        <div className="mt-6 flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} Minialife. All rights reserved.</span>
          <span>Crafted for the great outdoors.</span>
        </div>
      </div>
    </footer>
  );
}
