/**
 * Where to send the user after signing in, taken from a `?next=` value.
 * Only same-site paths are allowed: "//evil.com" or "https://evil.com" would
 * otherwise turn the login page into a redirect to another website.
 */
export function safeRedirectPath(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string") return fallback;
  const isSameSitePath =
    value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\");
  return isSameSitePath ? value : fallback;
}
