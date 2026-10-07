import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-accent-muted hover:text-accent-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent-muted data-[state=on]:text-accent-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-input-focus focus-visible:ring-focus-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40 aria-invalid:border-danger",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input-border bg-input-background shadow-soft hover:bg-accent-muted hover:text-accent-muted-foreground",
      },
      size: {
        default: "h-11 px-2 min-w-11",
        sm: "h-11 px-1.5 min-w-11",
        lg: "h-12 px-2.5 min-w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
