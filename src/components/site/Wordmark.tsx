export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col leading-none ${className}`}>
      <span className="font-serif text-2xl font-semibold tracking-tight text-primary md:text-3xl">WildPark<span className="text-foreground">Routes</span></span>
      <span className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.25em] text-muted-foreground">National parks · Road trips</span>
    </span>
  );
}
