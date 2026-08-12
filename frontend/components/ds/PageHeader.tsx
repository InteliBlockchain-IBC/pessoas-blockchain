"use client";

import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Header canônico de página. Antes deste componente, cada uma das 7 páginas
 * recombinava ícone + h1 + subtítulo por conta própria.
 *
 * O ícone é --text-muted e NÃO --accent de propósito: toda página teria um, e
 * um acento que aparece em toda tela deixa de significar alguma coisa. Os
 * cinco papéis do acento estão na spec §3.3.
 */
export function PageHeader({
  label,
  title,
  subtitle,
  icon: Icon,
  onBack,
  actions,
  className,
}: {
  label: string;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 border-b border-border pb-4", className)}>
      <div className="flex items-center gap-2">
        {/* O ponto quadrado é o papel 5 do acento (spec §3.3). */}
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-accent" />
        <span className="rotulo">{label}</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Voltar"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-field border border-border text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          {Icon && <Icon className="h-7 w-7 shrink-0 text-fg-muted" aria-hidden="true" />}
          <div className="min-w-0">
            <h1 className="titulo-pagina text-fg">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
