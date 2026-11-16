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

export function initAnalytics(measurementId: string) {
  if (initialized || typeof window === "undefined") return;
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return;
  initialized = true;

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

  // One delegated listener reports every outbound partner click.
  document.addEventListener("click", (e) => {
    const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!a) return;
    const hit = classifyPartnerLink(a.href);
    if (!hit) return;
    trackEvent("affiliate_click", { ...hit, ...pageContext(window.location.pathname), link_url: a.href });
  }, { capture: true });
}

export function trackEvent(name: string, params: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, { ...params, transport_type: "beacon" });
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
