const STORAGE_KEY = "tb_saved_plan_email";

// Tab-session only (sessionStorage, not localStorage): once someone saves a
// plan we skip re-prompting for the rest of this browser session, but a
// fresh visit later asks again rather than silently reusing an old email.
export function getCapturedEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(STORAGE_KEY);
}

export function setCapturedEmail(email: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, email);
}
