import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input-border file:text-foreground placeholder:text-foreground-muted selection:bg-primary selection:text-primary-foreground flex h-11 w-full min-w-0 rounded-md border bg-input-background px-3 py-1 text-body shadow-soft transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-input-focus focus-visible:ring-focus-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40 aria-invalid:border-danger",
        className
      )}
      {...props}
    />
  )
}

export { Input }
