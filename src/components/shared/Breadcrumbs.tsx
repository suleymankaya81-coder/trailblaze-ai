import { Link } from "@/components/site/LocalLink";
import { T } from "@/lib/i18n";
import { ChevronRight } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import type { Crumb } from "@/lib/seo/breadcrumbs";

// Crumb paths are already-resolved URLs, so links take a plain string.
const PathLink = Link as unknown as ComponentType<{ to: string; className?: string; children: ReactNode }>;

/** Visible trail matching breadcrumbJsonLd; the last crumb is the current page. */
export function Breadcrumbs({ crumbs, className = "" }: { crumbs: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-xs">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="inline-flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="opacity-90"><T>{c.name}</T></span>
              ) : (
                <PathLink to={c.path} className="hover:underline"><T>{c.name}</T></PathLink>
              )}
              {!last && <ChevronRight aria-hidden className="h-3 w-3 opacity-60" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
