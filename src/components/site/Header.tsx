import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import logoStacked from "@/assets/logos/minialife-stacked-mixedcase-trimmed.png";

const NAV = [
  { to: "/destinations", label: "Destinations" },
  { to: "/road-trips", label: "Road Trips" },
  { to: "/corridors/grand-circle-from-las-vegas", label: "Grand Circle" },
  { to: "/gear", label: "Gear Shop" },
  { to: "/about", label: "About" },
] as const;

const active = { className: "text-foreground underline decoration-forest decoration-2 underline-offset-8" };

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between gap-6 md:h-24">
        <Link to="/" className="flex items-center text-foreground" aria-label="MiniaLife home">
          <img src={logoStacked} alt="MiniaLife" width={598} height={737} className="h-16 w-auto md:h-20" />
        </Link>
        <nav className="hidden flex-1 items-center justify-end gap-7 text-sm font-medium md:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="text-foreground/80 hover:text-foreground" activeProps={active}>
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-border bg-background md:hidden">
          <div className="container-page flex flex-col py-2">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-base font-medium text-foreground last:border-0"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
