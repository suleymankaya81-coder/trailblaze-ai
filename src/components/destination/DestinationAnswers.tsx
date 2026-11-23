import { T, useLocale } from "@/lib/i18n";
import { ExternalLink } from "lucide-react";
import { visibleDestinationAnswers } from "@/lib/seo/visibleAnswers";

// The same helper feeds the FAQPage JSON-LD, so the markup mirrors exactly what is shown here.
export function DestinationAnswers({ slug }: { slug: string }) {
  const locale = useLocale();
  const guide = visibleDestinationAnswers(slug, locale);
  if (!guide) return null;
  return <section aria-labelledby="travel-answers" className="border-y border-border py-7">
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
      <h2 id="travel-answers" className="font-display text-2xl text-foreground"><T>A few things worth knowing</T></h2>
      <p className="text-xs text-muted-foreground">Access rules checked {guide.checkedOn} <T>· Recheck for your dates</T></p>
    </div>
    <dl className="grid gap-6 md:grid-cols-3">
      {guide.items.map(answer => <div key={answer.q} className="min-w-0">
        <dt className="text-sm font-semibold leading-relaxed text-foreground">{answer.q}</dt>
        <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {answer.a}
          <a href={answer.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex w-fit items-center gap-1 text-xs font-semibold text-primary underline underline-offset-4"><T>Official park information</T><ExternalLink className="h-3 w-3" /></a>
        </dd>
      </div>)}
    </dl>
  </section>;
}
