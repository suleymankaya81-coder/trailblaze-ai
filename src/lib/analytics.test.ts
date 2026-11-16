import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("GA stream configuration", () => {
  it("uses the supplied stream once and preserves page views and affiliate clicks", async () => {
    const scripts: { src?: string }[] = [];
    const listeners: Record<string, (event: unknown) => void> = {};
    const browser = { location: { pathname: "/", search: "", href: "https://wildparkroutes.com/" }, dataLayer: [] as unknown[] };
    vi.stubGlobal("window", browser);
    vi.stubGlobal("document", {
      title: "WildParkRoutes",
      createElement: () => ({}),
      head: { appendChild: (script: { src?: string }) => scripts.push(script) },
      addEventListener: (name: string, listener: (event: unknown) => void) => { listeners[name] = listener; },
    });
    const { initAnalytics, trackPageView } = await import("./analytics");
    initAnalytics("G-TEST2026");
    initAnalytics("G-ANOTHER2026");
    expect(scripts).toEqual([{ async: true, src: "https://www.googletagmanager.com/gtag/js?id=G-TEST2026" }]);
    const events = () => browser.dataLayer.map((entry) => Array.from(entry as ArrayLike<unknown>));
    expect(events()).toContainEqual(["config", "G-TEST2026", { send_page_view: false }]);
    trackPageView("/destinations");
    trackPageView("/destinations");
    expect(events().filter((entry) => entry[1] === "page_view")).toHaveLength(2);
    listeners.click?.({ target: { closest: () => ({ href: "https://www.viator.com/tours/example" }) } });
    expect(events().filter((entry) => entry[1] === "affiliate_click")).toHaveLength(1);
  });
});