// Trip-type search intents: these queries describe a kind of trip, not a
// place, so they open a hub page instead of guessing a destination.
export type SearchIntent = { to: string; search?: Record<string, string> };

const INTENTS: Array<{ words: RegExp; target: SearchIntent }> = [
  { words: /\b(rv|campervan|camper|motorhome|camping)\b/, target: { to: "/rv-camping" } },
  { words: /\bglamping\b/, target: { to: "/destinations", search: { tag: "glamping" } } },
  { words: /\b(road ?trips?|loops?|gateway)\b/, target: { to: "/road-trips" } },
  { words: /\bfly (and|&) drive\b/, target: { to: "/fly-and-drive" } },
  { words: /\bno[- ]reservations?\b|\bpermits?\b/, target: { to: "/no-reservation" } },
];

export function matchSearchIntent(query: string): SearchIntent | null {
  const q = query.trim().toLowerCase();
  return INTENTS.find((i) => i.words.test(q))?.target ?? null;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Whole-word match so short aliases ("la") never match inside other words ("glamping"). */
export function matchesTerm(query: string, term: string): boolean {
  const q = query.trim().toLowerCase();
  const t = term.trim().toLowerCase();
  if (!q || !t) return false;
  if (q === t) return true;
  if (q.length >= 3 && new RegExp(`\\b${escape(q)}`).test(t)) return true;
  return t.length >= 3 && new RegExp(`\\b${escape(t)}\\b`).test(q);
}
