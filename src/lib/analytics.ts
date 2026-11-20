// Google Analytics (GA4) — gtag.js initialization.
// The measurement ID is supplied from the project's public GA configuration.
import { classifyPartnerLink, pageContext } from "./affiliateTracking";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;
let lastPath: string | null = null;

function analyticsOwner(): Window {
  try {
    if (window.parent && window.parent !== window && window.parent.location.origin === window.location.origin) return window.parent;
  } catch { /* Cross-origin embedding cannot share analytics. */ }
  return window;
}

function installAffiliateClicks() {
  document.addEventListener("click", (e) => {
    const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!a) return;
    const hit = classifyPartnerLink(a.href);
    if (!hit) return;
    const owner = analyticsOwner();
    owner.gtag?.("event", "affiliate_click", { ...hit, ...pageContext(owner.location.pathname), link_url: a.href, transport_type: "beacon" });
  }, { capture: true });
}

export function initAnalytics(measurementId: string) {
  if (initialized || typeof window === "undefined") return;
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return;
  initialized = true;
  installAffiliateClicks();
  // Embedded Viator documents report to the actual EN/DE page, not separate page views.
  if (analyticsOwner() !== window) return;

  window.dataLayer = window.dataLayer || [];
  // gtag.js requires the native `arguments` object, not an array.
  // eslint-disable-next-line prefer-rest-params
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  } as (...args: unknown[]) => void;
  window.gtag("set", "developer_id.dZjgwMW", true);
  window.gtag("js", new Date());
  // Page views are sent manually so SPA navigations are counted once each.
  window.gtag("config", measurementId, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  trackPageView(window.location.pathname + window.location.search);

}

export function trackEvent(name: string, params: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, { ...params, transport_type: "beacon" });
}

export function trackPageView(path: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  if (analyticsOwner() !== window) return;
  if (path === lastPath) return;
  lastPath = path;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
