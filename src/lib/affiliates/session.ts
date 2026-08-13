const STORAGE_KEY = "tb_session_id";

// Stable per-browser id for grouping click_events across a visit.
// Not used for auth — just analytics attribution.
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return crypto.randomUUID();

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, id);
  return id;
}
