import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Junto com o StatusBadge, o KpiCard é um dos DOIS únicos consumidores de cor
 * semântica na plataforma (spec §3.3). Um número de KPI é um estado agregado —
 * "6 candidatos pendentes" carrega a mesma carga que um badge de pendência — e
 * a fileira de KPIs é o único lugar onde a cor precisa ler à distância.
 *
 * `hero` é reservado ao número mais importante da fileira. NUNCA mais de um por
 * fileira: se tudo é destaque, nada é.
 */
export type KpiTone = "success" | "warning" | "danger" | "neutral";

const CHIP: Record<KpiTone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-fg-muted",
};

export function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "neutral",
  hero = false,
  loading = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  tone?: KpiTone;
  hero?: boolean;
  loading?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-block border p-4",
        hero
          ? "border-transparent bg-accent text-accent-fg"
          : "border-border bg-surface-raised"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4 shrink-0", hero ? "text-accent-fg" : CHIP[tone])} aria-hidden="true" />
        <span className={cn(hero ? "rotulo-em-card !text-accent-fg" : "rotulo-em-card")}>
          {label}
        </span>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-16" />
      ) : (
        <span
          className={cn(
            "font-heading text-3xl font-bold tabular-nums",
            hero ? "text-accent-fg" : tone === "neutral" ? "text-fg" : CHIP[tone]
          )}
        >
          {value}
        </span>
      )}
      {sub && <span className={cn("text-xs", hero ? "text-accent-fg/80" : "text-fg-subtle")}>{sub}</span>}
    </div>
  );
}
