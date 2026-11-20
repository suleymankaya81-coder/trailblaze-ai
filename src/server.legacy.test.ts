import { describe, expect, it, vi } from "vitest";

vi.mock("./lib/error-capture", () => ({ consumeLastCapturedError: () => null }));
vi.mock("./lib/seo/sitemap.server", () => ({ buildChildSitemap: vi.fn(), buildSitemapResponse: vi.fn() }));
vi.mock("@tanstack/react-start/server-entry", () => ({
  default: {
    fetch: (request: Request) => new Response("page", {
      status: new URL(request.url).pathname === "/destinations/us/maine/acadia" ? 200 : 404,
    }),
  },
}));

import server from "./server";

describe("authority migration request flow", () => {
  it("returns a direct root-to-root 301 before rendering", async () => {
    const response = await server.fetch(new Request("http://world-national-parks.net/"), {}, {});
    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("https://wildparkroutes.com/");
  });
  it("returns 410 on the old host when the reported Diawling page does not exist", async () => {
    const response = await server.fetch(new Request("https://world-national-parks.net/mauritania/diawling"), {}, {});
    expect(response.status).toBe(410);
    expect(response.headers.get("location")).toBeNull();
  });
  it("redirects a rendered existing park to its exact modern address", async () => {
    const response = await server.fetch(new Request("https://www.world-national-parks.net/destinations/us/maine/acadia"), {}, {});
    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("https://wildparkroutes.com/destinations/us/maine/acadia");
  });
});