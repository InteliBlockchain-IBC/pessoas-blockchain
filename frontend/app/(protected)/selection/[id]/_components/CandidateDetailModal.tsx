import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  selectionService,
  Application,
  Stage,
  AnswerItem,
  EvaluationItem,
} from "@/services/selection.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ds/StatusBadge";
import { getTotalScore } from "./helpers";
import { StageSection } from "./StageSection";

// ─── Candidate Detail Modal ───────────────────────────────────────────────────

export function CandidateDetailModal({
  appId,
  stages,
  onClose,
}: {
  appId: string;
  stages: Stage[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    selectionService
      .getApplicationDetail(appId)
      .then(setApp)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [appId]);

  // Group answers by stageId
  const answersByStage = useMemo(() => {
    const m: Record<string, AnswerItem[]> = {};
    (app?.answers ?? []).forEach((a) => {
      const sid = a.question.stageId;
      if (!m[sid]) m[sid] = [];
      m[sid].push(a);
    });
    return m;
  }, [app]);

  // Group evaluations by stageId
  const evalsByStage = useMemo(() => {
    const m: Record<string, EvaluationItem[]> = {};
    (app?.evaluations ?? []).forEach((e) => {
      const sid = e.question.stageId;
      if (!m[sid]) m[sid] = [];
      m[sid].push(e);
    });
    return m;
  }, [app]);

  const totalScore = app ? getTotalScore(app) : null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl"> {/* check-visual: ok — largura do dialog, não da página */}
        <DialogHeader>
          <DialogTitle>
            {loading
              ? "Carregando..."
              : (app?.member?.name ?? "Detalhes do Candidato")}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin opacity-50" />
            </div>
          ) : !app ? (
            <p className="text-sm opacity-60 text-center py-8">
              Não foi possível carregar os detalhes.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Summary bar */}
              <div className="flex flex-wrap gap-3 items-center">
                <StatusBadge status={app.status} />
                {app.member?.email && (
                  <span className="text-xs opacity-50">{app.member.email}</span>
                )}
                {totalScore != null && (
                  <span className="ml-auto text-sm font-bold text-accent">
                    Total: {totalScore.toFixed(2)} pts
                  </span>
                )}
              </div>

              {/* Demographics */}
              {(app.member?.gender ||
                app.member?.race ||
                app.member?.isLgbtqia != null) && (
                <div className="flex flex-wrap gap-4 text-xs bg-surface border border-border rounded-block px-4 py-2.5">
                  {app.member?.gender && (
                    <span>
                      Gênero:{" "}
                      <strong className="text-fg">{app.member.gender}</strong>
                    </span>
                  )}
                  {app.member?.race && (
                    <span>
                      Raça/Cor:{" "}
                      <strong className="text-fg">{app.member.race}</strong>
                    </span>
                  )}
                  {app.member?.isLgbtqia != null && (
                    <span>
                      LGBTQIA+:{" "}
                      <strong className="text-fg">
                        {app.member.isLgbtqia ? "Sim" : "Não"}
                      </strong>
                    </span>
                  )}
                </div>
              )}

              {/* Per-stage breakdown */}
              {stages.map((stage) => {
                const result = app.results?.find((r) => r.stageId === stage.id);
                const answers = answersByStage[stage.id] ?? [];
                const evals = evalsByStage[stage.id] ?? [];

                if (answers.length === 0 && evals.length === 0 && !result)
                  return null;

                return (
                  <StageSection
                    key={stage.id}
                    stage={stage}
                    result={result}
                    answers={answers}
                    evals={evals}
                  />
                );
              })}

              {/* General notes */}
              {app.notes && (
                <div className="bg-surface border border-border rounded-block p-3 text-xs text-fg opacity-80 whitespace-pre-wrap">
                  <strong className="block mb-1 opacity-60">
                    Observações gerais:
                  </strong>
                  {app.notes}
                </div>
              )}

              {/* Link to profile */}
              <button
                onClick={() => {
                  onClose();
                  router.push(`/members/${app.memberId}`);
                }}
                className="self-start text-xs text-accent hover:underline"
              >
                Ver perfil completo do membro →
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
