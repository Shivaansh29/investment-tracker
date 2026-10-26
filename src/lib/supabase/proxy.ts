import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

/** Pages that require a signed-in user. */
const PROTECTED_PREFIXES = ["/dashboard"];
/** Pages a signed-in user has no reason to see. */
const AUTH_PAGES = ["/login", "/signup"];

/**
 * Runs before every page: refreshes the Supabase session cookie if needed,
 * then makes quick redirect decisions. This is an optimistic check only;
 * pages still verify the user on the server (see src/lib/auth.ts).
 */
export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Make refreshed cookies visible to the page being rendered...
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        // ...and send them back to the browser.
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Stops CDNs caching a response that carries someone's session.
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });

  // Verifies the session token (and refreshes it when it is about to expire).
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims);

  const { pathname, search } = request.nextUrl;

  if (!isSignedIn && PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return redirectWithCookies(loginUrl, response);
  }

  if (isSignedIn && AUTH_PAGES.includes(pathname)) {
    return redirectWithCookies(new URL("/dashboard", request.url), response);
  }

  return response;
}

/**
 * A redirect that keeps any refreshed auth cookies (so the session isn't lost)
 * and the no-cache headers that must travel with them.
 */
function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url);
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie);
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = from.headers.get(header);
    if (value) redirect.headers.set(header, value);
  }
  return redirect;
}
