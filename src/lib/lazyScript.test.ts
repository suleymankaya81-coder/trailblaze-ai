import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadWhenNear } from "./lazyScript";

type Listener = () => void;
function fakeWindow() {
  const listeners = new Map<string, Listener>();
  let observerCb: ((e: { isIntersecting: boolean }[]) => void) | null = null;
  const observed: unknown[] = [];
  vi.stubGlobal("window", {
    IntersectionObserver: true,
    addEventListener: (e: string, f: Listener) => listeners.set(e, f),
    removeEventListener: (e: string) => listeners.delete(e),
  });
  vi.stubGlobal("IntersectionObserver", class { constructor(cb: typeof observerCb) { observerCb = cb; } observe(el: unknown) { observed.push(el); } disconnect() { observerCb = null; } });
  vi.stubGlobal("document", { querySelectorAll: () => [{ tag: "a" }] });
  return { listeners, observed, intersect: () => observerCb?.([{ isIntersecting: true }]) };
}
afterEach(() => vi.unstubAllGlobals());

describe("third-party scripts load only when needed", () => {
  it("waits until a matching link is near the viewport, then loads once", () => {
    const w = fakeWindow();
    const load = vi.fn();
    loadWhenNear("a", load);
    expect(load).not.toHaveBeenCalled();
    expect(w.observed).toHaveLength(1);
    w.intersect(); w.intersect();
    expect(load).toHaveBeenCalledTimes(1);
  });
  it("also loads on the first scroll or tap", () => {
    const w = fakeWindow();
    const load = vi.fn();
    loadWhenNear("a", load);
    w.listeners.get("scroll")!();
    expect(load).toHaveBeenCalledTimes(1);
    expect(w.listeners.size).toBe(0);
  });
});

// Large static tables must stay server-side: only loaders/server functions may import them.
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(n) && !/\.test\./.test(n) ? [p] : []; });
}
describe("client bundle stays small", () => {
  it("routes.json and nearby.json are imported only by server-side data modules", () => {
    const importers = files("src").filter((f) => /from "@\/data\/(routes|nearby)\.json"/.test(readFileSync(f, "utf8")));
    expect(importers.sort()).toEqual(["src/lib/data/destinations.functions.ts", "src/lib/data/nearby.ts"]);
    const nearbyUsers = files("src").filter((f) => /from "(\.\/nearby|@\/lib\/data\/nearby)"/.test(readFileSync(f, "utf8")));
    expect(nearbyUsers).toEqual(["src/lib/data/destinations.functions.ts"]);
  });
});
