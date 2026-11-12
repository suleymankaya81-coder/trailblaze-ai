import { T } from "@/lib/i18n";
import { useState } from "react";
import { Link } from "@/components/site/LocalLink";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/site/Wordmark";
import { useLocale, t, type DictKey } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

const NAV = [
  { to: "/destinations", de: "/de/destinations", key: "nav.destinations" },
  { to: "/road-trips", de: "/de/road-trips", key: "nav.roadTrips" },
  { to: "/trip-guides", de: null, key: "nav.tripGuides" },
  { to: "/gear", de: null, key: "nav.gear" },
  { to: "/about", de: null, key: "nav.about" },
] as const satisfies readonly { to: string; de: string | null; key: DictKey }[];

const active = { className: "text-foreground underline decoration-forest decoration-2 underline-offset-8" };

export function Header() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  // German visitors see German-available sections first; English-only sections stay reachable.
  const items = NAV.map((n) => ({ to: (locale === "de" && n.de) || n.to, label: t(locale, n.key) }));
  const home = locale === "de" ? "/de" : "/";
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between gap-6 md:h-24">
        <Link to={home} className="flex items-center text-foreground" aria-label="WildParkRoutes home">
          <Wordmark />
        </Link>
        <nav className="hidden flex-1 items-center justify-end gap-7 text-sm font-medium md:flex">
          {items.map((n) => (
            <Link key={n.to} to={n.to} className="text-foreground/80 hover:text-foreground" activeProps={active}>
              <T>{n.label}</T>
            </Link>
          ))}
          <LanguageSwitcher />
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            aria-label={t(locale, open ? "nav.closeMenu" : "nav.openMenu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border bg-background md:hidden">
          <div className="container-page flex flex-col py-2">
            {items.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-base font-medium text-foreground last:border-0"
              >
                <T>{n.label}</T>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
