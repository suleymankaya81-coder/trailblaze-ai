import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findDestination: vi.fn(),
  loader: undefined as undefined | ((input: { deps: { q: string } }) => Promise<unknown>),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: { loader: typeof mocks.loader }) => {
    mocks.loader = options.loader;
    return {};
  },
  redirect: (target: unknown) => target,
}));
vi.mock("@/lib/data/destinations.functions", () => ({ findDestinationSlugByQuery: mocks.findDestination }));
vi.mock("@/components/site/Header", () => ({ Header: () => null }));
vi.mock("@/components/site/Footer", () => ({ Footer: () => null }));
vi.mock("@/components/site/SearchBar", () => ({ SearchBar: () => null }));

import "../../routes/search";

function search(q: string) {
  if (!mocks.loader) throw new Error("Search loader was not registered");
  return mocks.loader({ deps: { q } });
}

describe("search destination priority", () => {
  beforeEach(() => mocks.findDestination.mockReset());

  it("opens Gateway Arch instead of the road trips hub", async () => {
    mocks.findDestination.mockResolvedValue({ slug: "gateway-arch-national-park" });
    await expect(search("Gateway Arch")).rejects.toEqual({ to: "/destinations/$slug", params: { slug: "gateway-arch-national-park" } });
    expect(mocks.findDestination).toHaveBeenCalledWith({ data: { query: "Gateway Arch" } });
  });

  it("opens Yellowstone for Yellowstone camping", async () => {
    mocks.findDestination.mockResolvedValue({ slug: "yellowstone-national-park" });
    await expect(search("Yellowstone camping")).rejects.toEqual({ to: "/destinations/$slug", params: { slug: "yellowstone-national-park" } });
  });

  it("keeps general RV searches on the RV hub when no place matches", async () => {
    mocks.findDestination.mockResolvedValue({ slug: null });
    await expect(search("RV Adventure")).rejects.toEqual({ to: "/rv-camping", search: undefined });
  });

  it("keeps unmatched searches in the no-results state", async () => {
    mocks.findDestination.mockResolvedValue({ slug: null });
    await expect(search("unknown place xyz")).resolves.toEqual({ q: "unknown place xyz" });
  });
});