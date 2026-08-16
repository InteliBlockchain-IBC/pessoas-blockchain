"use client";

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
import { ApplicationSummary } from "@/components/selection/ApplicationSummary";
import { StageBlock } from "@/components/selection/StageBlock";

// ─── Candidate Detail Modal ───────────────────────────────────────────────────

export function CandidateDetailModal({
  appId,
  stages,
  canEdit,
  onClose,
}: {
  appId: string;
  stages: Stage[];
  canEdit: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStageId, setActiveStageId] = useState<string | undefined>();

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
              {app.member?.email && (
                <span className="text-xs opacity-50">{app.member.email}</span>
              )}

              <ApplicationSummary
                application={app}
                canEdit={canEdit}
                stages={stages}
                activeStageId={activeStageId}
                onSelectStage={setActiveStageId}
                onSaved={setApp}
              />

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
              <div className="flex flex-col">
                {stages.map((stage) => {
                  const result = app.results?.find((r) => r.stageId === stage.id);
                  const answers = answersByStage[stage.id] ?? [];
                  const evals = evalsByStage[stage.id] ?? [];

                  // Sem canEdit, esconde etapas sem nenhum dado (comportamento
                  // já existente). Com canEdit, mostra todas — é assim que o
                  // avaliador inicia uma etapa nunca tocada.
                  if (
                    !canEdit &&
                    answers.length === 0 &&
                    evals.length === 0 &&
                    !result
                  )
                    return null;

                  return (
                    <StageBlock
                      key={stage.id}
                      applicationId={appId}
                      stage={stage}
                      result={result}
                      answers={answers}
                      evals={evals}
                      canEdit={canEdit}
                      defaultOpen
                      forceOpen={stage.id === activeStageId}
                      onSaved={setApp}
                    />
                  );
                })}
              </div>

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
