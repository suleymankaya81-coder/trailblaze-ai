import { describe, it, expect } from "vitest";
import { viatorAssurances } from "./viatorPlace.functions";
import { STAY_CHOICES } from "@/routes/destinations.$slug";
describe("tour and stay labels", () => {
  it("shows tour labels only when Viator flags say so", () => {
    expect(viatorAssurances(undefined)).toEqual({ freeCancellation: false, mobileTicket: false });
    expect(viatorAssurances(["FREE_CANCELLATION"])).toEqual({ freeCancellation: true, mobileTicket: false });
    expect(viatorAssurances(["MOBILE_TICKET", "PRIVATE_TOUR"]).mobileTicket).toBe(true);
  });
  it("stay prices are estimates", () => {
    for (const c of STAY_CHOICES) expect(c.price.startsWith("Est. from")).toBe(true);
  });
});
