import { getDestinationAnswers } from "@/lib/data/destinationAnswers";
import { tp, type Locale } from "@/lib/i18n";
import type { Faq } from "./flyDrive";

export type VisibleAnswer = { q: string; a: string; sourceUrl: string };

/**
 * The reviewed answers exactly as the destination page shows them (questions run through
 * the same phrase translation as <T>; answers are shown as stored). The visible section and
 * the FAQPage JSON-LD both read this, so markup can never contain text the page does not show.
 */
export function visibleDestinationAnswers(slug: string, locale: Locale = "en"): { checkedOn: string; items: VisibleAnswer[] } | null {
  const guide = getDestinationAnswers(slug);
  if (!guide || !guide.answers.length) return null;
  return {
    checkedOn: guide.checkedOn,
    items: guide.answers.map((x) => ({ q: tp(locale, x.question), a: x.answer, sourceUrl: x.sourceUrl })),
  };
}

/** FAQ entries for JSON-LD: only the answers rendered by <DestinationAnswers>. */
export function visibleAnswerFaqs(slug: string, locale: Locale = "en"): Faq[] {
  return (visibleDestinationAnswers(slug, locale)?.items ?? []).map(({ q, a }) => ({ q, a }));
}
