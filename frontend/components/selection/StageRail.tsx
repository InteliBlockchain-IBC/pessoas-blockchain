"use client";

import { Check, X } from "lucide-react";
import type { Stage, StageResultItem } from "@/services/selection.service";

export interface RailStage {
  id: string;
  title: string;
  order: number;
  /** PENDING | PASSED | FAILED | SKIPPED */
  status: string;
  score: number | null;
}

/**
 * Monta os nós da trilha a partir dos resultados de uma candidatura. Usado
 * no perfil do membro, que não carrega o processo inteiro — só etapas com
 * resultado registrado aparecem.
 */
export function railStagesFromResults(
  results: StageResultItem[] | undefined,
): RailStage[] {
  return [...(results ?? [])]
    .sort((a, b) => a.stage.order - b.stage.order)
    .map((r) => ({
      id: r.stageId,
      title: r.stage.title,
      order: r.stage.order,
      status: r.status,
      score: r.score,
    }));
}

/**
 * Monta os nós a partir da lista completa de etapas do processo — usado só
 * quando o chamador já tem `stages[]` em memória (não busca de novo). Etapas
 * sem resultado aparecem como nós PENDING vazios.
 */
export function railStagesFromStages(
  stages: Stage[],
  results: StageResultItem[] | undefined,
): RailStage[] {
  return [...stages]
    .sort((a, b) => a.order - b.order)
    .map((stage) => {
      const r = results?.find((x) => x.stageId === stage.id);
      return {
        id: stage.id,
        title: stage.title,
        order: stage.order,
        status: r?.status ?? "PENDING",
        score: r?.score ?? null,
      };
    });
}

/** 52.5 → "52,5" · 32 → "32" · null → "—" */
function fmtScore(score: number | null): string {
  if (score == null) return "—";
  return String(score).replace(".", ",");
}

const NODE_CLASS: Record<string, string> = {
  PASSED: "bg-success text-fg-on-bright border-transparent",
  FAILED: "bg-danger-surface text-fg-on-deep border-transparent",
  SKIPPED: "bg-transparent text-transparent border-border-interactive",
  PENDING: "bg-transparent text-transparent border-border-interactive",
};

export interface StageRailProps {
  stages: RailStage[];
  activeStageId?: string;
  onSelect?: (stageId: string) => void;
}

export function StageRail({ stages, activeStageId, onSelect }: StageRailProps) {
  if (stages.length === 0) return null;

  // O trilho colorido vai até o último nó já decidido. Um nó só (sem trilho a
  // desenhar) cai em 0 e o gradiente não aparece — comportamento correto.
  const lastDecided = stages.reduce(
    (acc, s, i) => (s.status === "PASSED" || s.status === "FAILED" ? i : acc),
    -1,
  );
  const progress =
    stages.length > 1 ? Math.max(0, lastDecided) / (stages.length - 1) : 0;

  // Os nós são flex-1: o centro do primeiro fica a (50/n)% da largura e o do
  // último a 100-(50/n)%. O trilho tem que começar e terminar nesses pontos —
  // ancorar numa margem fixa desalinha a linha dos nós.
  const edge = 50 / stages.length;
  const span = 100 - 2 * edge;

  return (
    <div className="relative flex items-start justify-between gap-2 pt-1">
      {/* trilho de fundo — decorativo, sem texto por cima */}
      <div
        aria-hidden
        className="absolute top-4 h-[2px] bg-border"
        style={{ left: `${edge}%`, right: `${edge}%` }}
      />
      <div
        aria-hidden
        className="absolute top-4 h-[2px]"
        style={{
          left: `${edge}%`,
          width: `${span * progress}%`,
          background: "linear-gradient(90deg, #63b4c4, #8c4ca9)",
        }}
      />

      {stages.map((s) => {
        const active = s.id === activeStageId;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect?.(s.id)}
            aria-label={`Etapa ${s.title}`}
            className={`relative z-10 flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-field px-1 py-1 transition-colors ${
              active ? "bg-surface" : "hover:bg-surface"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                NODE_CLASS[s.status] ?? NODE_CLASS.PENDING
              } ${active ? "ring-2 ring-focus-ring" : ""}`}
            >
              {s.status === "PASSED" && <Check size={13} strokeWidth={3} />}
              {s.status === "FAILED" && <X size={13} strokeWidth={3} />}
            </span>

            <span className="font-heading text-lg font-bold tabular-nums leading-none text-fg">
              {fmtScore(s.score)}
            </span>

            <span className="w-full truncate text-center text-[11px] text-fg-muted">
              {s.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
