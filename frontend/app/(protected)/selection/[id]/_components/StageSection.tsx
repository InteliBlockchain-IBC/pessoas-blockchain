import { useState } from "react";
import { ChevronUp, ChevronDown, Clock } from "lucide-react";
import {
  Stage,
  AnswerItem,
  EvaluationItem,
  StageResultItem,
} from "@/services/selection.service";
import { stageIcon } from "./helpers";

// ─── Stage Section ────────────────────────────────────────────────────────────

export function StageSection({
  stage,
  result,
  answers,
  evals,
}: {
  stage: Stage;
  result: StageResultItem | undefined;
  answers: AnswerItem[];
  evals: EvaluationItem[];
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-col gap-3 border border-border rounded-field overflow-hidden">
      {/* Stage header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 px-4 py-3 bg-surface-raised hover:bg-surface transition-colors text-left"
      >
        {result ? stageIcon(result.status) : <Clock size={14} className="opacity-30" />}
        <span className="font-bold text-fg text-sm flex-1">{stage.title}</span>
        {result?.score != null && (
          <span className="text-sm font-semibold text-accent">
            {result.score} pts
          </span>
        )}
        {open ? (
          <ChevronUp size={14} className="opacity-50" />
        ) : (
          <ChevronDown size={14} className="opacity-50" />
        )}
      </button>

      {open && (
        <div className="flex flex-col gap-4 px-4 pb-4">
          {/* Stage notes */}
          {result?.notes && (
            <div className="text-xs bg-surface border border-border rounded-block px-3 py-2.5 text-fg whitespace-pre-wrap">
              <span className="font-semibold opacity-50 block mb-1">
                Observação da etapa:
              </span>
              {result.notes}
            </div>
          )}

          {/* Text answers per question */}
          {answers.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold opacity-50 uppercase tracking-wide">
                Respostas
              </p>
              {answers.map((a) => (
                <div key={a.id} className="flex flex-col gap-1">
                  <p className="text-xs font-semibold text-accent">
                    {a.question.order}. {a.question.title}
                  </p>
                  <p className="text-sm text-fg bg-surface border border-border rounded-block px-3 py-2 whitespace-pre-wrap leading-relaxed">
                    {a.answerText}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Evaluations per question */}
          {evals.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold opacity-50 uppercase tracking-wide">
                Avaliações
              </p>
              {evals.map((e) => (
                <div key={e.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-accent">
                      {e.question.order}. {e.question.title}
                    </p>
                    {e.score != null && (
                      <span className="text-xs font-mono font-bold text-fg bg-surface-raised border border-border px-2 py-0.5 rounded">
                        {e.score}
                        {e.question.maxScore > 0 && (
                          <span className="opacity-50">
                            /{e.question.maxScore}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  {e.notes && (
                    <p className="text-sm text-fg bg-surface border border-border rounded-block px-3 py-2 whitespace-pre-wrap leading-relaxed">
                      {e.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {answers.length === 0 && evals.length === 0 && !result?.notes && (
            <p className="text-xs opacity-40">
              Sem respostas ou avaliações registradas para esta etapa.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
