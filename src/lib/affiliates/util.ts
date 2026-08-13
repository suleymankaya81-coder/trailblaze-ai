// Shared helper for adapters: appends tracking query params to a base URL,
// falling back to the untouched base if it isn't a parseable absolute URL.
export function withTrackingParams(base: string, params: Record<string, string>): string {
  try {
    const url = new URL(base);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  } catch {
    return base;
  }
}
