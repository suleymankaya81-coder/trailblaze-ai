import { describe, expect, it } from "vitest";
import { DESCRIPTION_MAX, TITLE_MAX } from "./routeSeo";
import { noReservationDescription, noReservationTitle, rvCampingDescription, rvCampingTitle } from "./guidesSeo";

const short = { name: "Acadia", airportCode: "BHB", driveMinutes: 25 };
const long = {
  name: "Grand Staircase-Escalante National Monument",
  airportCode: "CDC",
  driveMinutes: 95,
};

describe("RV & camping guide search metadata", () => {
  it("targets the '{name} rv camping' phrase", () => {
    expect(rvCampingTitle(short).toLowerCase()).toContain("acadia rv camping");
    expect(rvCampingDescription(short).toLowerCase()).toContain("rv");
  });

  it("includes the airport drive when known", () => {
    expect(rvCampingDescription(short)).toContain("BHB");
  });

  it("fits limits even with very long destination names", () => {
    expect(rvCampingTitle(long).length).toBeLessThanOrEqual(TITLE_MAX);
    expect(rvCampingDescription(long).length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });

  it("drops the drive segment when no airport", () => {
    const d = rvCampingDescription({ name: "Isle Royale", airportCode: null, driveMinutes: null });
    expect(d).not.toContain("drive from");
  });
});

describe("No-reservation guide search metadata", () => {
  it("targets the '{name} reservations' phrase", () => {
    expect(noReservationTitle(short).toLowerCase()).toContain("acadia reservations");
    expect(noReservationDescription(short).toLowerCase()).toContain("reservation");
  });

  it("fits limits even with very long destination names", () => {
    expect(noReservationTitle(long).length).toBeLessThanOrEqual(TITLE_MAX);
    expect(noReservationDescription(long).length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });
});
