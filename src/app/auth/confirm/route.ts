import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * The link in Supabase's confirmation email lands here. It carries either a
 * one-time `code` (default email template) or a `token_hash` (custom template);
 * both are exchanged for a session cookie, then the user goes to the dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeRedirectPath(searchParams.get("next"));
  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, origin));

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    // Supabase only issues a code after it has confirmed the email. Signing in
    // with it can still fail, usually because the link was opened in a different
    // browser from the one used to sign up (the PKCE verifier cookie lives there).
    // The account is confirmed either way, so ask the user to log in.
    return redirectTo(error ? "/login?notice=email-confirmed" : next);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    return redirectTo(error ? "/login?error=confirmation" : next);
  }

  // No code at all: Supabase rejected the link itself (e.g. ?error_code=otp_expired).
  return redirectTo("/login?error=confirmation");
}
