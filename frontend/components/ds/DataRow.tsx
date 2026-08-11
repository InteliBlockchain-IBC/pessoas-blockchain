import { cn } from "@/lib/utils";

/**
 * Altura de linha compartilhada por DataRow e Field. É o que garante que a
 * troca leitura<->edição de uma seção não mude a altura do card (spec §7.3).
 * Mudar aqui exige mudar nos dois e rodar DataRow.test.tsx.
 */
export const LINHA_ALTURA = "min-h-10";

export function DataRow({
  label,
  value,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  className?: string;
}) {
  const vazio = value === null || value === undefined || value === "";
  return (
    <div
      className={cn(
        LINHA_ALTURA,
        "flex items-center gap-4 border-b border-border py-2 last:border-b-0",
        className
      )}
    >
      <span className="w-36 shrink-0 text-sm text-fg-muted">{label}</span>
      <span className="min-w-0 flex-1 text-sm text-fg">
        {vazio ? <span className="text-fg-subtle">—</span> : value}
      </span>
    </div>
  );
}
