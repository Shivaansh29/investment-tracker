import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // 48px tall and 16px text: easy to tap, and iOS does not zoom in on focus
        "border-input bg-panel text-foreground placeholder:text-muted-foreground h-12 w-full min-w-0 rounded-md border px-3.5 text-base transition-colors",
        // Focus: the border turns gold and a gold outline sits right on top of it,
        // giving one crisp 2px line instead of a soft glow
        "focus-visible:border-bullion focus-visible:outline-bullion focus-visible:outline-2 focus-visible:-outline-offset-1",
        "aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
