import type { User } from "@supabase/supabase-js";

/**
 * With "Confirm email" on, signing up again with an already-registered email
 * doesn't error: Supabase returns a placeholder user with no identities and
 * sends no email (so the form can't be used to probe who has an account).
 * Detecting it lets us tell the user to log in instead of waiting for an email.
 */
export function isAlreadyRegistered(user: Pick<User, "identities"> | null): boolean {
  return Boolean(user && user.identities && user.identities.length === 0);
}
