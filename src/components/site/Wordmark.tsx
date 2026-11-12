export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex flex-col leading-none ${className}`} aria-label="WildParkRoutes">
      <span className="font-serif text-2xl font-semibold tracking-tight text-primary md:text-3xl">WildParkRoutes</span>
      <svg viewBox="0 0 200 14" className="mt-0.5 h-2.5 w-full md:h-3" aria-hidden="true" preserveAspectRatio="none">
        <path d="M4 10 C50 2 95 4 125 8 C140 10 132 12 128 11 C150 13 175 7 192 4" fill="none" stroke="#E8A33D" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="194" cy="4" r="3" fill="#E8A33D" />
      </svg>
    </span>
  );
}
