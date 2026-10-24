import { expect, it } from "vitest";
import { BOOKING_STEPS } from "./bookingSteps";
it("booking order is flight, vehicle, data, tours", () => {
  expect(BOOKING_STEPS.map((s) => s.key)).toEqual(["flight", "vehicle", "data", "tours"]);
});
