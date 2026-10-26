"use server";

import type { AuthError } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { isAlreadyRegistered } from "@/lib/signup-result";
import { createClient } from "@/lib/supabase/server";

/** What a login/sign-up form shows after submitting. */
export type AuthFormState =
  | {
      error?: string;
      message?: string;
      /** Echoed back so the email field keeps its value after an error. */
      email?: string;
    }
  | undefined;

const MIN_PASSWORD_LENGTH = 8;

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Friendly wording for the Supabase errors people actually hit. */
function describeAuthError(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "Incorrect email or password.";
    case "email_not_confirmed":
      return "Please confirm your email first. Check your inbox for the link.";
    case "user_already_exists":
      return "An account with this email already exists. Try logging in.";
    case "weak_password":
      return "That password is too weak. Try a longer one.";
    case "email_address_invalid":
      return "Please enter a valid email address.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Please wait a minute and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData);
  if (!isEmail(email) || !password) {
    return { error: "Enter your email and password.", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: describeAuthError(error), email };

  redirect(safeRedirectPath(formData.get("next")));
}

export async function signup(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData);
  if (!isEmail(email)) return { error: "Please enter a valid email address.", email };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`, email };
  }

  // The confirmation email links back to this site, wherever it is running.
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? `http://${requestHeaders.get("host")}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });
  if (error) return { error: describeAuthError(error), email };

  // Supabase sent no email because this address already has an account.
  if (isAlreadyRegistered(data.user)) {
    return { error: "An account with this email already exists. Please log in instead.", email };
  }

  // Email confirmation turned off in Supabase: the user is signed in already.
  if (data.session) redirect("/dashboard");

  return {
    message: `Almost there! We sent a confirmation link to ${email}. Open it to finish signing up. It can take a minute; check your spam folder too.`,
    email,
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
