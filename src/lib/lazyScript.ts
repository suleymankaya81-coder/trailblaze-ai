/**
 * Run `load` once, only when one of the matching elements comes within `margin` of the viewport,
 * or on the visitor's first scroll/tap/key press (whichever happens first). Returns a cleanup.
 * Used for third-party scripts that do not need to run before the visitor reaches their content.
 */
export function loadWhenNear(selector: string, load: () => void, margin = "600px"): () => void {
  if (typeof window === "undefined") return () => {};
  let done = false;
  const events = ["scroll", "pointerdown", "keydown", "touchstart"] as const;
  const fire = () => {
    if (done) return;
    done = true;
    cleanup();
    load();
  };
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) fire(); }, { rootMargin: margin })
    : null;
  document.querySelectorAll(selector).forEach((el) => io?.observe(el));
  for (const e of events) window.addEventListener(e, fire, { passive: true, once: true });
  function cleanup() {
    io?.disconnect();
    for (const e of events) window.removeEventListener(e, fire);
  }
  return cleanup;
}

/** Outbound partner links that the Travelpayouts script may rewrite. */
export const OUTBOUND_LINKS = 'a[href^="http"]:not([href*="wildparkroutes.com"])';
