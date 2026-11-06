import { T } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { LOCALES, localeFromPath, t } from "@/lib/i18n";

/**
 * Links to the same page in other languages, read from the page's hreflang
 * tags so untranslated pages never offer a missing version. Never redirects
 * automatically — search engines must see every version.
 */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = localeFromPath(pathname);
  const [alts, setAlts] = useState<Record<string, string>>({});

  useEffect(() => {
    // Head tags update after navigation; read them on the next frame.
    const id = requestAnimationFrame(() => {
      const map: Record<string, string> = {};
      document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]').forEach((l) => {
        const lang = l.getAttribute("hreflang");
        if (lang && lang !== "x-default") map[lang] = new URL(l.href).pathname;
      });
      setAlts(map);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  const options = LOCALES.filter((l) => l.code === current || alts[l.hreflang]);
  if (options.length < 2) return null;
  return (
    <nav aria-label={t(current, "lang.label")} className={`flex items-center gap-1 text-xs font-semibold ${className}`}>
      {options.map((l) =>
        l.code === current ? (
          <span key={l.code} aria-current="true" className="rounded-full bg-primary px-2.5 py-1 text-primary-foreground"><T>{l.short}</T></span>
        ) : (
          <a key={l.code} href={alts[l.hreflang]} hrefLang={l.hreflang} lang={l.hreflang} title={l.label} className="rounded-full px-2.5 py-1 text-foreground/80 hover:bg-muted hover:text-foreground"><T>{l.short}</T></a>
        ),
      )}
    </nav>
  );
}
