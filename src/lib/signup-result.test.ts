import type { UserIdentity } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { isAlreadyRegistered } from "./signup-result";

describe("isAlreadyRegistered", () => {
  it("spots Supabase's placeholder user for an existing email", () => {
    expect(isAlreadyRegistered({ identities: [] })).toBe(true);
  });

  it("treats a real new sign-up as new", () => {
    expect(isAlreadyRegistered({ identities: [{ id: "1" } as UserIdentity] })).toBe(false);
  });

  it("handles a missing user or identities", () => {
    expect(isAlreadyRegistered(null)).toBe(false);
    expect(isAlreadyRegistered({ identities: undefined })).toBe(false);
  });
});
