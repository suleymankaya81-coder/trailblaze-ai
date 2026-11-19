import { describe, expect, it } from "vitest";
import { AUTHORITY_COUNTRY, authorityTarget, legacyResponse } from "./legacy";

const loc = (u: string) => legacyResponse(new URL(u))?.headers.get("location");
describe("authority domain mapping", () => {
  it("German pages go to the Germany country page", () => { expect(authorityTarget("/eu/ge/ge.htm", false)).toBe("/destinations/de"); expect(authorityTarget("/eu/ge.htm", false)).toBe("/destinations/de"); });
  it("Austria, Italy, Spain, UK, Canada map to their country pages", () => { expect(authorityTarget("/eu/au/au.htm", false)).toBe("/destinations/at"); expect(authorityTarget("/eu/it/it.htm", false)).toBe("/destinations/it"); expect(authorityTarget("/eu/sp.htm", false)).toBe("/destinations/es"); expect(authorityTarget("/eu/uk/uk.htm", false)).toBe("/destinations/gb"); expect(authorityTarget("/ca/ca.htm", false)).toBe("/destinations/ca"); });
  it("Estonia (/eu/es) is not Spain and Australia (/au) is not Austria", () => { expect(authorityTarget("/eu/es/es.htm", false)).toBe("/destinations"); expect(authorityTarget("/au/au.htm", false)).toBe("/destinations"); });
  it("Portugal, Greece and France map to their country pages (/eu/pt is NOT Portugal)", () => {
    expect(authorityTarget("/eu/pr/pr.htm", false)).toBe("/destinations/pt");
    expect(authorityTarget("/eu/gr/gr.htm", false)).toBe("/destinations/gr");
    expect(authorityTarget("/eu/fr/fr.htm", false)).toBe("/destinations/fr");
    expect(authorityTarget("/eu/pt/pt.htm", false)).toBe("/destinations");
  });
  it("Canada and old .htm pages go to destinations", () => { expect(authorityTarget("/index.html", false)).toBe("/destinations"); });
  it("authority homepage goes to destinations", () => expect(loc("https://world-national-parks.net/")).toBe("https://wildparkroutes.com/destinations"));
  it("authority host keeps modern paths", () => expect(loc("https://www.world-national-parks.net/destinations/us/maine/acadia")).toBe("https://wildparkroutes.com/destinations/us/maine/acadia"));
  it("our own homepage is untouched", () => expect(legacyResponse(new URL("https://wildparkroutes.com/"))).toBeNull());
  it.each([
    ["/eu/no/no.htm", "no"], ["/eu/sw/sw.htm", "se"], ["/eu/fi/fi", "fi"],
    ["/eu/ic/ic.htm", "is"], ["/eu/ir/ir.htm", "ie"], ["/eu/ne/ne.htm", "nl"],
  ])("recovers the live country link %s", (path, country) => {
    const response = legacyResponse(new URL(`https://world-national-parks.net${path}`));
    expect(response?.status).toBe(301);
    expect(response?.headers.get("location")).toBe(`https://wildparkroutes.com/destinations/${country}`);
  });
  it.each([
    ["cr", "hr"], ["es", "ee"], ["hu", "hu"], ["la", "lv"],
    ["li", "lt"], ["po", "pl"], ["ro", "ro"], ["sl", "si"],
  ])("retains %s identity without redirecting to an unpublished country", (oldCode, country) => {
    expect(AUTHORITY_COUNTRY[`/eu/${oldCode}`]).toBe(country);
    expect(authorityTarget(`/eu/${oldCode}/${oldCode}.htm`, true)).toBe("/destinations");
  });
  it("does not invent a Swiss, Belgian or Danish historical country code", () => {
    expect(AUTHORITY_COUNTRY["/eu/sl"]).toBe("si");
    expect(AUTHORITY_COUNTRY["/eu/ch"]).toBeUndefined();
    expect(AUTHORITY_COUNTRY["/eu/be"]).toBeUndefined();
    expect(AUTHORITY_COUNTRY["/eu/de"]).toBeUndefined();
  });
});

import { legacyHostResponse } from "./legacy";
describe("old domain after migration", () => {
  it("forwards a page that exists", () => expect(legacyHostResponse(new URL("https://minialife.com/destinations/acadia"), 200).headers.get("location")).toBe("https://wildparkroutes.com/destinations/us/maine/acadia"));
  it("answers missing old pages with 410", () => expect(legacyHostResponse(new URL("https://minialife.com/plans/x"), 404).status).toBe(410));
});
