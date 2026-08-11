import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const base =
      "font-heading font-bold rounded-block transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    // O primário leva texto ESCURO. Branco sobre #1b98e0 dá 3,17:1 e reprova
    // o WCAG AA — ver DESIGN_SYSTEM.md §1.5.
    const variants = {
      primary: "bg-accent text-accent-fg hover:bg-accent-hover",
      secondary: "bg-transparent text-accent border border-accent hover:bg-surface-raised",
      ghost: "bg-transparent text-fg-muted hover:bg-surface-raised hover:text-fg",
      danger: "bg-danger-surface text-fg-on-deep hover:opacity-90",
    };

    const sizes = {
      sm: "px-4 py-1 text-sm",
      md: "px-6 py-2 text-base",
      lg: "px-8 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
