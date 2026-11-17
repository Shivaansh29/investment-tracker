"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleAlert, CircleCheck, MailCheck } from "lucide-react";
import { login, signup, type AuthFormState } from "@/app/(auth)/actions";
import { AuthLink } from "@/components/auth/auth-link";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LINK_ERRORS: Record<string, string> = {
  confirmation: "That confirmation link is invalid or has expired. Please log in or sign up again.",
};

const LINK_NOTICES: Record<string, string> = {
  "email-confirmed": "Your email is confirmed. Log in to continue.",
};

/** Email + password form, shared by the login and sign-up pages. */
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    mode === "login" ? login : signup,
    undefined,
  );
  const searchParams = useSearchParams();
  const error = state?.error ?? LINK_ERRORS[searchParams.get("error") ?? ""];
  // Hide the notice once the user has submitted, so it never sits next to an error.
  const notice = state ? undefined : LINK_NOTICES[searchParams.get("notice") ?? ""];

  if (state?.message) {
    return (
      // data-auth-sent tells AuthCard (via CSS) to step back and let this be the page
      <div role="status" data-auth-sent className="space-y-6">
        {/* Gold, not green: this is "look here next", not a gain */}
        <MailCheck className="text-bullion size-10" strokeWidth={1.5} aria-hidden />
        <h2 className="type-condensed text-5xl leading-[0.95] font-extrabold sm:text-6xl">
          Check your inbox
        </h2>
        {/* wrap-anywhere: the message contains the email address, which can be one long word */}
        <p className="text-base leading-relaxed wrap-anywhere">{state.message}</p>
        <p className="border-line text-muted-foreground border-t pt-6 text-sm">
          Already opened the link? <AuthLink href="/login">Log in</AuthLink>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* Where to go after logging in, e.g. back to the page that asked for it */}
      <input type="hidden" name="next" value={searchParams.get("next") ?? ""} />

      {/* Messages sit above the fields so they are the first thing read.
          Only one of the two can show after a submit (see `notice` above). */}
      {notice && (
        <p
          role="status"
          className="border-gain/40 bg-gain/10 text-gain flex items-start gap-2.5 rounded-md border p-3 text-sm font-medium"
        >
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          {notice}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-md border p-3 text-sm font-medium"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          // Base UI reads defaultValue only once, so a new field is mounted when the
          // server action echoes the email back (otherwise it logs a warning)
          key={state?.email ?? ""}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          defaultValue={state?.email}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "signup" ? 8 : undefined}
          aria-describedby={mode === "signup" ? "password-hint" : undefined}
        />
        {mode === "signup" && (
          <p id="password-hint" className="text-muted-foreground text-sm">
            At least 8 characters.
          </p>
        )}
      </div>

      <Button type="submit" size="xl" className="w-full" disabled={pending}>
        {pending
          ? mode === "login"
            ? "Logging in…"
            : "Creating account…"
          : mode === "login"
            ? "Log in"
            : "Create account"}
      </Button>
    </form>
  );
}
