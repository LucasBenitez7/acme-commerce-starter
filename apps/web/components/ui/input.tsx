import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // base
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary hover:bg-neutral-50 selection:text-primary-foreground dark:bg-input/30 h-9 w-full min-w-0 border rounded-xs border-border bg-background px-2 py-1 text-sm shadow-xs transition-[border-color,box-shadow,color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",

        // focus: borde negro y sombra sutil, sin ring
        "focus-visible:border-foreground focus-visible:bg-neutral-50",

        // error: borde + sombra rojos (sin aura extra)
        "aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
