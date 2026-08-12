import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Application } from "@/services/selection.service";

// ─── Constants ────────────────────────────────────────────────────────────────

export const APP_STATUS_LABEL: Record<string, string> = {
  APPROVED: "Aprovado",
  REJECTED: "Reprovado",
  IN_REVIEW: "Em revisão",
  SUBMITTED: "Submetido",
  DRAFT: "Rascunho",
  WITHDRAWN: "Retirado",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function stageIcon(status: string) {
  if (status === "PASSED")
    return <CheckCircle2 size={14} className="text-success shrink-0" />;
  if (status === "FAILED")
    return <XCircle size={14} className="text-danger shrink-0" />;
  return <Clock size={14} className="opacity-40 shrink-0" />;
}

export function getScore(app: Application, stageId: string): number | null {
  return app.results?.find((r) => r.stageId === stageId)?.score ?? null;
}

export function getStageStatus(app: Application, stageId: string): string {
  return app.results?.find((r) => r.stageId === stageId)?.status ?? "PENDING";
}

export function getTotalScore(app: Application): number | null {
  const scores = (app.results ?? [])
    .map((r) => r.score)
    .filter((s): s is number => s != null);
  return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) : null;
}
