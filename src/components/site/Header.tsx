import { Link } from "@tanstack/react-router";
import { Mountain } from "lucide-react";

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="container-page flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <Mountain className="h-5 w-5" />
          <span className="font-display text-xl tracking-tight">Minialife</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link to="/" className="text-foreground/80 hover:text-foreground">Destinations</Link>
          <a href="#stay-types" className="text-foreground/80 hover:text-foreground">Stays</a>
          <a href="#rentals" className="text-foreground/80 hover:text-foreground">Rentals</a>
          <a href="#how" className="text-foreground/80 hover:text-foreground">How it works</a>
        </nav>
        <Link
          to="/"
          className="hidden rounded-full border border-foreground/15 px-4 py-2 text-sm text-foreground/90 backdrop-blur transition hover:bg-background/60 md:inline-block"
        >
          Start Planning
        </Link>
      </div>
    </header>
  );
}
