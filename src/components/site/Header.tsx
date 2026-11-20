import { T } from "@/lib/i18n";
import { useState } from "react";
import { Link } from "@/components/site/LocalLink";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/site/Wordmark";
import { useLocale, t, type DictKey } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { COUNTRY_DIRECTORY, CONTINENTS, countryLabel } from "@/lib/data/countryDirectory";
import { countryPath } from "@/lib/routes/paths";

const NAV = [
  { to: "/destinations", de: "/de/destinations", fr: "/fr/destinations", key: "nav.destinations" },
  { to: "/road-trips", de: "/de/road-trips", fr: null, key: "nav.roadTrips" },
  { to: "/trip-guides", de: null, fr: null, key: "nav.tripGuides" },
  { to: "/gear", de: null, fr: null, key: "nav.gear" },
  { to: "/about", de: null, fr: null, key: "nav.about" },
] as const satisfies readonly { to: string; de: string | null; fr: string | null; key: DictKey }[];

const active = { className: "text-foreground underline decoration-forest decoration-2 underline-offset-8" };

export function Header() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  // German visitors see German-available sections first; English-only sections stay reachable.
  const items = NAV.map((n) => ({ to: (locale === "de" && n.de) || (locale === "fr" && n.fr) || n.to, label: t(locale, n.key) }));
  const home = locale === "en" ? "/" : `/${locale}`;
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between gap-6 md:h-24">
        <Link to={home} className="flex items-center text-foreground" aria-label="WildParkRoutes home">
          <Wordmark />
        </Link>
        <nav className="hidden flex-1 items-center justify-end gap-7 text-sm font-medium md:flex">
          {items.map((n, i) => i === 0 ? (
            <div key={n.to} className="group relative">
              <Link to={n.to} className="text-foreground/80 hover:text-foreground" activeProps={active} aria-haspopup="true">
                <T>{n.label}</T>
              </Link>
              <div className="invisible absolute left-1/2 top-full z-50 w-[520px] -translate-x-1/2 pt-4 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
                  {CONTINENTS.map((ct) => (
                    <div key={ct.key}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"><T>{ct.label}</T></p>
                      <ul className="mt-2 space-y-1">
                        {COUNTRY_DIRECTORY.filter((c) => c.continent === ct.key).map((c) => (
                          <li key={c.code}><Link to={countryPath(c.code, locale)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-muted"><span aria-hidden="true">{c.flag}</span>{countryLabel(c.code, locale)}<span className="ml-auto text-xs text-muted-foreground">{c.places}</span></Link></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <Link to={n.to} className="col-span-2 border-t border-border pt-3 text-sm font-semibold text-primary hover:underline"><T>All destinations</T> →</Link>
                </div>
              </div>
            </div>
          ) : (
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
            <div className="flex flex-wrap gap-2 py-3">
              {COUNTRY_DIRECTORY.map((c) => (
                <Link key={c.code} to={countryPath(c.code, locale)} onClick={() => setOpen(false)} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border px-3 text-sm text-foreground">
                  <span aria-hidden="true">{c.flag}</span>{countryLabel(c.code, locale)}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
