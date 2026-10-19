import { Link } from "@tanstack/react-router";
import { Search, User } from "lucide-react";
import logoStacked from "@/assets/logos/minialife-stacked-mixedcase-trimmed.png";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container-page flex h-24 items-center justify-between gap-6">
        <Link to="/" className="flex items-center text-foreground" aria-label="MiniaLife home">
          <img
            src={logoStacked}
            alt="MiniaLife"
            width={598}
            height={737}
            className="h-20 w-auto"
          />
        </Link>
        <nav className="hidden flex-1 items-center gap-7 text-sm font-medium md:flex">
          <Link to="/" className="text-foreground/80 hover:text-foreground">
            Destinations
          </Link>
          <a href="#stay-types" className="text-foreground/80 hover:text-foreground">
            Stays
          </a>
          <a href="#rentals-gear" className="text-foreground/80 hover:text-foreground">
            Rentals
          </a>
          <Link to="/gear/7-bikepacking-essentials" className="text-foreground/80 hover:text-foreground">
            Gear
          </Link>
          <a href="#stories" className="text-foreground/80 hover:text-foreground">
            Stories
          </a>
          <a href="#how" className="text-foreground/80 hover:text-foreground">
            How it works
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <button
            aria-label="Search"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-foreground/70 hover:bg-muted md:inline-flex"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            aria-label="Account"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-foreground/70 hover:bg-muted md:inline-flex"
          >
            <User className="h-4 w-4" />
          </button>
          <Link
            to="/"
            className="rounded-full bg-copper px-4 py-2 text-xs font-semibold uppercase tracking-wider text-off-white hover:bg-copper/90"
          >
            Plan a trip
          </Link>
        </div>
      </div>
    </header>
  );
}
