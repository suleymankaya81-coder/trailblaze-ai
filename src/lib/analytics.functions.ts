import { createServerFn } from "@tanstack/react-start";

// A GA measurement ID is public browser configuration, not an API credential.
// Return only this allowlisted value; never serialize other environment values.
export const getAnalyticsMeasurementId = createServerFn({ method: "GET" }).handler(() => {
  const measurementId = process.env["GOOGLE_ANALYTICS_MEASUREMENT_ID"]?.trim();
  return measurementId && /^G-[A-Z0-9]+$/.test(measurementId) ? measurementId : null;
});