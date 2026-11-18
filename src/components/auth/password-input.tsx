"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Password field with a show/hide button, so people can check what they
 * typed (most useful on a phone). It always starts hidden.
 */
export function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        // While shown, the field is a plain text input: stop phones from
        // capitalising, autocorrecting or spell-checking the password
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        // Room on the right so long passwords never run under the button
        className={cn("pr-12", className)}
      />
      {/* type="button" so pressing it never submits the form */}
      <button
        type="button"
        aria-pressed={visible}
        // A fixed name plus aria-pressed reads as "Show password, pressed" when visible
        aria-label="Show password"
        onClick={() => setVisible((current) => !current)}
        // 48px square (the full height of the field). The focus outline is
        // pulled inwards so it stays inside the field's border.
        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-md transition-colors focus-visible:-outline-offset-4"
      >
        {visible ? (
          <EyeOff className="size-5" aria-hidden />
        ) : (
          <Eye className="size-5" aria-hidden />
        )}
      </button>
    </div>
  );
}
