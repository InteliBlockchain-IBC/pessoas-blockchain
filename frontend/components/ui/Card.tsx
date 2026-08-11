import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "educational" | "featured";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    // `featured` é onde a assinatura da marca aparece de propósito: borda 3px
    // e sombra sólida deslocada, sem blur. No máximo um por tela, e nunca em
    // elemento repetido de lista — DESIGN_SYSTEM.md §4.3.
    const variants = {
      default: "bg-surface-raised border border-border",
      educational: "bg-educational text-fg-on-deep border border-border",
      featured:
        "bg-surface-raised border-[3px] border-fg shadow-[8px_8px_0_0_var(--ibc-gradient-start)]",
    };

    return (
      <div
        ref={ref}
        className={`p-6 rounded-block ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
