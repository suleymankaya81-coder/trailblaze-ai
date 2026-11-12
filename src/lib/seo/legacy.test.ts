import { describe, expect, it } from "vitest";
import { authorityTarget, legacyResponse } from "./legacy";

const loc = (u: string) => legacyResponse(new URL(u))?.headers.get("location");
describe("authority domain mapping", () => {
  it("German park pages go to the German catalogue", () => expect(authorityTarget("/eu/ge/ge.htm", false)).toBe("/de/destinations"));
  it("other Europe pages go to trip guides", () => expect(authorityTarget("/eu/eu.htm", false)).toBe("/trip-guides"));
  it("Canada and old .htm pages go to destinations", () => { expect(authorityTarget("/ca/ca.htm", false)).toBe("/destinations"); expect(authorityTarget("/index.html", false)).toBe("/destinations"); });
  it("authority homepage goes to destinations", () => expect(loc("https://world-national-parks.net/")).toBe("https://minialife.com/destinations"));
  it("authority host keeps modern paths", () => expect(loc("https://www.world-national-parks.net/destinations/us/maine/acadia")).toBe("https://minialife.com/destinations/us/maine/acadia"));
  it("our own homepage is untouched", () => expect(legacyResponse(new URL("https://minialife.com/"))).toBeNull());
});

import { legacyHostResponse } from "./legacy";
describe("old domain after migration", () => {
  it("forwards a page that exists", () => expect(legacyHostResponse(new URL("https://minialife.com/destinations/acadia"), 200).headers.get("location")).toBe("https://minialife.com/destinations/us/maine/acadia"));
  it("answers missing old pages with 410", () => expect(legacyHostResponse(new URL("https://minialife.com/plans/x"), 404).status).toBe(410));
});
