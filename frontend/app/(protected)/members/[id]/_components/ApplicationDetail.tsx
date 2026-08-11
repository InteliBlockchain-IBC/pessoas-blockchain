import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { selectionService, Application, EvaluationItem, AnswerItem } from "@/services/selection.service";

// ─── Application detail (lazy-loaded) ─────────────────────────────────────────

export function ApplicationDetail({ appId }: { appId: string }) {
  const [detail, setDetail] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    selectionService
      .getApplicationDetail(appId)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [appId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 size={16} className="animate-spin opacity-40" />
      </div>
    );
  }

  if (!detail) {
    return (
      <p className="text-xs opacity-50 py-2">
        Não foi possível carregar os detalhes.
      </p>
    );
  }

  const stageNotes = detail.results?.filter((r) => r.notes) ?? [];

  // Agrupar avaliações por etapa
  const evalsByStage = new Map<
    string,
    { stageName: string; order: number; evals: EvaluationItem[] }
  >();
  for (const ev of detail.evaluations ?? []) {
    const key = ev.question.stageId;
    if (!evalsByStage.has(key)) {
      evalsByStage.set(key, {
        stageName: ev.question.stage.title,
        order: ev.question.stage.order,
        evals: [],
      });
    }
    evalsByStage.get(key)!.evals.push(ev);
  }
  const stageGroups = [...evalsByStage.values()].sort(
    (a, b) => a.order - b.order,
  );
  const hasEvals = stageGroups.some((g) => g.evals.length > 0);

  // Agrupar respostas do candidato por etapa
  const answersByStage = new Map<
    string,
    { stageName: string; order: number; answers: AnswerItem[] }
  >();
  for (const ans of detail.answers ?? []) {
    const key = ans.question.stageId;
    if (!answersByStage.has(key)) {
      answersByStage.set(key, {
        stageName: ans.question.stage.title,
        order: ans.question.stage.order,
        answers: [],
      });
    }
    answersByStage.get(key)!.answers.push(ans);
  }
  const answerGroups = [...answersByStage.values()].sort(
    (a, b) => a.order - b.order,
  );
  const hasAnswers = answerGroups.some((g) => g.answers.length > 0);

  if (!hasEvals && !hasAnswers && stageNotes.length === 0) {
    return (
      <p className="text-xs opacity-50 py-2">
        Sem avaliações ou respostas registradas.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5 pt-3">
      {/* Anotações gerais por etapa (notas do StageResult) */}
      {stageNotes.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-accent uppercase tracking-wide">
            Anotações por etapa
          </p>
          {stageNotes.map((r) => (
            <div key={r.id} className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-fg">
                {r.stage.title}
              </span>
              <p className="text-xs opacity-70 italic">{r.notes}</p>
            </div>
          ))}
        </div>
      )}

      {/* Respostas de texto do candidato (questões sem nota) */}
      {hasAnswers && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-accent uppercase tracking-wide">
            Respostas do candidato
          </p>
          {answerGroups.map(({ stageName, answers }) => (
            <div key={stageName} className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-fg opacity-70">
                {stageName}
              </p>
              {answers
                .sort((a, b) => a.question.order - b.question.order)
                .map((ans) => (
                  <div
                    key={ans.id}
                    className="flex flex-col gap-1 pl-3 border-l-2 border-border"
                  >
                    <p className="text-xs text-fg font-medium">
                      {ans.question.title}
                    </p>
                    <p className="text-xs opacity-60 leading-relaxed">
                      {ans.answerText}
                    </p>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}

      {/* Avaliações com nota por questão */}
      {hasEvals && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-accent uppercase tracking-wide">
            Avaliações por questão
          </p>
          {stageGroups.map(({ stageName, evals }) => (
            <div key={stageName} className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-fg opacity-70">
                {stageName}
              </p>
              {evals
                .sort((a, b) => a.question.order - b.question.order)
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="flex flex-col gap-0.5 pl-3 border-l-2 border-border"
                  >
                    <p className="text-xs text-fg font-medium">
                      {ev.question.title}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {ev.score != null && ev.question.maxScore > 0 && (
                        <span className="text-xs font-semibold text-accent">
                          {ev.score}/{ev.question.maxScore} pts
                        </span>
                      )}
                      {ev.notes && (
                        <span className="text-xs opacity-60 italic">
                          {ev.notes}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
