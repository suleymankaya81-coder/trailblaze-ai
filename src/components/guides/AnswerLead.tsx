/** Answer-first paragraph right under a page hero (text composed from stored facts by the caller). */
export function AnswerLead({ lines }: { lines: string[] }) {
  if (!lines.length) return null;
  return (
    <section aria-label="Short answer" className="container-page pt-8">
      <p id="answer" className="max-w-3xl text-lg leading-relaxed text-foreground">{lines.join(" ")}</p>
    </section>
  );
}
