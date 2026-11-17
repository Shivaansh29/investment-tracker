import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
};

/**
 * The signed-in user, or null. The session token is verified (not just read),
 * and `cache` means the header and the page share one check per request.
 */
export const getOptionalUser = cache(async (): Promise<CurrentUser | null> => {
  // Checking the token reads the clock (is it expired yet?). Reading cookies alone
  // isn't enough for Next.js to treat that as per-request, so say so explicitly;
  // otherwise it reports Date.now() "while prerendering" for signed-in visitors.
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  return { id: claims.sub, email: claims.email ?? "" };
});

/** The signed-in user; sends anyone else to the login page. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getOptionalUser();
  if (!user) redirect("/login");
  return user;
}
