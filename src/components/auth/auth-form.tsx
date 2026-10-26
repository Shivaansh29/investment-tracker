"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleAlert, CircleCheck, MailCheck } from "lucide-react";
import { login, signup, type AuthFormState } from "@/app/(auth)/actions";
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
      <div role="status" className="bg-primary/5 flex gap-3 rounded-lg p-4 text-sm">
        <MailCheck className="text-primary mt-0.5 size-5 shrink-0" aria-hidden />
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Where to go after logging in, e.g. back to the page that asked for it */}
      <input type="hidden" name="next" value={searchParams.get("next") ?? ""} />

      {notice && (
        <p
          role="status"
          className="bg-gain/10 text-gain flex items-start gap-2 rounded-lg p-3 text-sm font-medium"
        >
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          {notice}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          defaultValue={state?.email}
          className="h-10"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "signup" ? 8 : undefined}
          aria-describedby={mode === "signup" ? "password-hint" : undefined}
          className="h-10"
        />
        {mode === "signup" && (
          <p id="password-hint" className="text-muted-foreground text-xs">
            At least 8 characters.
          </p>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg p-3 text-sm"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <Button type="submit" className="h-10 w-full" disabled={pending}>
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
