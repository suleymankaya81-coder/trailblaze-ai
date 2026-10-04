// Google Analytics (GA4) — gtag.js initialization.
// The measurement ID is a public value; it is safe to keep in client code.
const MEASUREMENT_ID = "G-SVQECQ1RK3";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;
let lastPath: string | null = null;

export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.dataLayer = window.dataLayer || [];
  // gtag.js requires the native `arguments` object, not an array.
  // eslint-disable-next-line prefer-rest-params
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  } as (...args: unknown[]) => void;
  window.gtag("js", new Date());
  // Page views are sent manually so SPA navigations are counted once each.
  window.gtag("config", MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  trackPageView(window.location.pathname + window.location.search);
}

export function trackPageView(path: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  if (path === lastPath) return;
  lastPath = path;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
