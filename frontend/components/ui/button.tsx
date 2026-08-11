import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-block font-heading font-bold transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-focus-ring/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Texto ESCURO sobre o acento — ver DESIGN_SYSTEM.md §1.5.
        default: "bg-accent text-accent-fg hover:bg-accent-hover",
        outline: "border border-accent bg-transparent text-accent hover:bg-surface-raised",
        ghost: "bg-transparent text-fg-muted hover:bg-surface-raised hover:text-fg",
        destructive: "bg-danger-surface text-fg-on-deep hover:opacity-90",
      },
      size: {
        sm: "h-8 px-4 text-sm",
        default: "h-10 px-6 text-base",
        lg: "h-12 px-8 text-lg",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
