import { InputHTMLAttributes, forwardRef, useId } from "react";
import { AlertCircle } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm text-fg-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-10 px-4 rounded-field bg-surface-sunken text-fg placeholder:text-fg-subtle transition-colors focus:outline-none focus:border-accent ${
            error ? "border-[3px] border-danger" : "border border-border-interactive"
          } ${className}`}
          {...props}
        />
        {/* Restrição: a mensagem nunca é só a borda vermelha. Estado nunca é
            comunicado só por cor — DESIGN_SYSTEM.md §8. */}
        {error && (
          <span id={errorId} className="flex items-center gap-1 text-xs text-danger">
            <AlertCircle size={14} aria-hidden="true" />
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
