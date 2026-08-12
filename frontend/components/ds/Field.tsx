"use client";

import { Children, cloneElement, isValidElement, useId } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { LINHA_ALTURA } from "./DataRow";

/**
 * Par rótulo/campo do modo edição. Espelha o DataRow na altura — ver
 * LINHA_ALTURA e spec §7.3.
 *
 * O erro NUNCA é comunicado só pela borda: sempre texto + ícone
 * (DESIGN_SYSTEM.md §8).
 */
export function Field({
  label,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const errorId = `${id}-erro`;
  const hintId = `${id}-dica`;

  const only = Children.only(children);
  const campo = isValidElement<Record<string, unknown>>(only)
    ? cloneElement(only, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby":
          [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined,
      })
    : only;

  return (
    <div className={cn(LINHA_ALTURA, "flex flex-col gap-1 border-b border-border last:border-b-0", className)}>
      <div className="flex items-center gap-4">
        <label htmlFor={id} className="w-36 shrink-0 text-sm text-fg-muted">
          {label}
        </label>
        <div className="min-w-0 flex-1">{campo}</div>
      </div>
      {hint && !error && (
        <p id={hintId} className="pl-40 text-xs text-fg-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-center gap-1 pl-40 text-xs text-danger">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
