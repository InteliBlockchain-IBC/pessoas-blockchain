"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/ds/StatusBadge";
import {
  selectionService,
  Application,
  Stage,
} from "@/services/selection.service";
import { useRouter } from "next/navigation";
import { APPLICATION_STATUS_LABEL } from "@/lib/labels";
import { StageResultBadge } from "./StageResultBadge";
import { ApplicationSummary } from "@/components/selection/ApplicationSummary";
import { StageBlock } from "@/components/selection/StageBlock";

// ─── Application card — sempre expandido ───────────────────────────────────

export function ApplicationCard({
  app,
  canEdit,
}: {
  app: Application;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState<Application | null>(null);
  // Etapas com questões — só buscado quando canEdit. A leitura não precisa:
  // cada resposta/avaliação já embute a questão inteira.
  const [stagesWithQuestions, setStagesWithQuestions] = useState<Stage[] | null>(
    null,
  );
  const [activeStageId, setActiveStageId] = useState<string | undefined>();

  // A fatia mais fresca conhecida: o detalhe buscado no mount (e re-buscado
  // após qualquer salvamento), com fallback pro resumo que a página já
  // tinha. Enquanto `detail` é null, o detalhe ainda está carregando — sem
  // estado de loading próprio.
  const current = detail ?? app;

  useEffect(() => {
    if (detail) return;
    selectionService
      .getApplicationDetail(app.id)
      .then(setDetail)
      .catch(() => {});

    if (canEdit) {
      selectionService
        .getProcess(app.processId)
        .then((p) => setStagesWithQuestions(p?.stages ?? []))
        .catch(() => {});
    }
  }, [detail, app.id, app.processId, canEdit]);

  return (
    <div className="flex flex-col gap-3 p-4 bg-surface border border-border rounded-block">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-fg">
            {app.process?.name ?? "Processo desconhecido"}
            {app.process?.year && (
              <span className="text-xs font-normal opacity-60 ml-2">
                ({app.process.year})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge
            status={current.status}
            label={APPLICATION_STATUS_LABEL[current.status] ?? current.status}
          />
          <button
            onClick={() => router.push(`/selection/${app.processId}`)}
            className="text-xs text-accent hover:underline flex items-center gap-0.5"
          >
            Ver processo <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {current.results && current.results.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {current.results.map((r) => (
            <StageResultBadge key={r.id} result={r} />
          ))}
        </div>
      )}

      {!detail ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={16} className="animate-spin opacity-40" />
        </div>
      ) : (
        <div className="flex flex-col gap-2 pt-1">
          <ApplicationSummary
            application={current}
            canEdit={canEdit}
            activeStageId={activeStageId}
            onSelectStage={setActiveStageId}
            onSaved={setDetail}
          />
          {(current.results ?? [])
            .slice()
            .sort((a, b) => a.stage.order - b.stage.order)
            .map((r) => {
              const stage = stagesWithQuestions?.find(
                (s) => s.id === r.stageId,
              ) ?? {
                id: r.stageId,
                title: r.stage.title,
                order: r.stage.order,
              };
              return (
                <StageBlock
                  key={r.id}
                  applicationId={app.id}
                  stage={stage}
                  result={r}
                  answers={(current.answers ?? []).filter(
                    (a) => a.question.stageId === r.stageId,
                  )}
                  evals={(current.evaluations ?? []).filter(
                    (e) => e.question.stageId === r.stageId,
                  )}
                  canEdit={canEdit}
                  forceOpen={r.stageId === activeStageId}
                  onSaved={setDetail}
                />
              );
            })}
        </div>
      )}
    </div>
  );
}
