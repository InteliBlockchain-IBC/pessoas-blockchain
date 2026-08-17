"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronUp, ChevronDown, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionCard } from "@/components/ds/SectionCard";
import { DataRow } from "@/components/ds/DataRow";
import { Field } from "@/components/ds/Field";
import { STATUS_LABELS } from "@/components/ds/StatusBadge";
import {
  selectionService,
  Application,
  Stage,
  Question,
  AnswerItem,
  EvaluationItem,
  StageResultItem,
} from "@/services/selection.service";
import { stageIcon, CAMPO } from "./helpers";

const RESULT_STATUS_OPTIONS = ["PENDING", "PASSED", "FAILED", "SKIPPED"];

/**
 * O formulário guarda tudo em string (ou `null` pra campo limpo) — campo
 * vazio é um estado válido. `montarPayload` (ds/section-payload.ts) já
 * normaliza "" pra `null` no diff, mesmo T[K] sendo tipado `string`.
 */
interface StageForm {
  status: string;
  score: string | null;
  notes: string | null;
  answers: Record<string, string>;
  evalScores: Record<string, string | null>;
  evalNotes: Record<string, string | null>;
}

function buildForm(
  result: StageResultItem | undefined,
  questions: Question[],
  answers: AnswerItem[],
  evals: EvaluationItem[],
): StageForm {
  const form: StageForm = {
    status: result?.status ?? "PENDING",
    score: result?.score != null ? String(result.score) : null,
    notes: result?.notes ?? null,
    answers: {},
    evalScores: {},
    evalNotes: {},
  };
  for (const q of questions) {
    form.answers[q.id] =
      answers.find((a) => a.questionId === q.id)?.answerText ?? "";
    const ev = evals.find((e) => e.questionId === q.id);
    form.evalScores[q.id] = ev?.score != null ? String(ev.score) : null;
    form.evalNotes[q.id] = ev?.notes ?? null;
  }
  return form;
}

/**
 * string (aceita vírgula) ou `null` → o que a API espera.
 * `undefined` = campo não mudou (omite do corpo, preserva); `null` = usuário
 * limpou (apaga); `number` = novo valor.
 */
function scoreForApi(
  v: string | null | undefined,
): number | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v.trim() === "") return null;
  const n = Number(v.trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function notesForApi(v: string | null | undefined): string | null | undefined {
  return v;
}

/** União dos IDs de questão que têm resposta e/ou avaliação, ordenada. Uma
 * questão pode ter só avaliação (ex.: entrevista sem resposta de texto). */
function stageRows(answers: AnswerItem[], evals: EvaluationItem[]) {
  const byId = new Map<
    string,
    {
      questionId: string;
      order: number;
      title: string;
      answer?: AnswerItem;
      evaluation?: EvaluationItem;
    }
  >();
  for (const a of answers) {
    byId.set(a.questionId, {
      questionId: a.questionId,
      order: a.question.order,
      title: a.question.title,
      answer: a,
    });
  }
  for (const e of evals) {
    const existing = byId.get(e.questionId);
    if (existing) existing.evaluation = e;
    else
      byId.set(e.questionId, {
        questionId: e.questionId,
        order: e.question.order,
        title: e.question.title,
        evaluation: e,
      });
  }
  return [...byId.values()].sort((a, b) => a.order - b.order);
}

function StageReadOnly({
  result,
  answers,
  evals,
}: {
  result: StageResultItem | undefined;
  answers: AnswerItem[];
  evals: EvaluationItem[];
}) {
  if (answers.length === 0 && evals.length === 0 && !result?.notes) {
    return (
      <p className="text-xs opacity-40 py-2">
        Sem respostas ou avaliações registradas para esta etapa.
      </p>
    );
  }

  const rows = stageRows(answers, evals);

  return (
    <div className="flex flex-col gap-4">
      {result?.notes && <DataRow label="Observação" value={result.notes} />}

      {rows.map((row) => (
        <div key={row.questionId} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-accent">
              {row.order}. {row.title}
            </p>
            {row.evaluation?.score != null && (
              <span className="shrink-0 text-xs font-mono font-bold text-fg">
                {row.evaluation.score}
                {row.evaluation.question.maxScore > 0 && (
                  <span className="opacity-50">
                    /{row.evaluation.question.maxScore}
                  </span>
                )}
              </span>
            )}
          </div>
          {row.answer && (
            <p className="border-l-2 border-border pl-3 text-sm text-fg whitespace-pre-wrap leading-relaxed">
              {row.answer.answerText}
            </p>
          )}
          {row.evaluation?.notes && (
            <p className="pl-3 text-xs italic text-fg-muted whitespace-pre-wrap">
              {row.evaluation.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export interface StageBlockProps {
  applicationId: string;
  /** `questions` só precisa vir preenchido quando `canEdit` — quem chama
   * busca isso sob demanda (ver ApplicationCard/CandidateDetailModal). */
  stage: Stage;
  result: StageResultItem | undefined;
  answers: AnswerItem[];
  evals: EvaluationItem[];
  canEdit: boolean;
  defaultOpen?: boolean;
  /** Quando vira `true`, força a etapa a abrir e rola até ela — usado pelo
   * clique num nó do StageRail. */
  forceOpen?: boolean;
  /** Chamado com a Application inteira, recém-buscada, após salvar. */
  onSaved: (app: Application) => void;
}

export function StageBlock({
  applicationId,
  stage,
  result,
  answers,
  evals,
  canEdit,
  defaultOpen = false,
  forceOpen = false,
  onSaved,
}: StageBlockProps) {
  const [open, setOpen] = useState(defaultOpen);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!forceOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com o clique num nó do StageRail (prop externa), não deriva de outro estado; mesmo padrão já usado em members/[id]/page.tsx e ds/SectionCard.tsx
    setOpen(true);
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [forceOpen]);

  const questions = useMemo(
    () => [...(stage.questions ?? [])].sort((a, b) => a.order - b.order),
    [stage.questions],
  );

  // Precisa ser memoizado: SectionCard sincroniza seu estado interno a
  // partir da IDENTIDADE do prop `values` (useEffect com dep [values]).
  // Um objeto novo a cada render dispararia esse efeito toda hora.
  const form = useMemo(
    () => buildForm(result, questions, answers, evals),
    [result, questions, answers, evals],
  );

  const handleSave = async (
    payload: Partial<StageForm>,
  ): Promise<StageForm | void> => {
    const calls: Promise<void>[] = [];

    if (
      payload.status !== undefined ||
      payload.score !== undefined ||
      payload.notes !== undefined
    ) {
      calls.push(
        selectionService.upsertStageResult(applicationId, stage.id, {
          status: payload.status ?? form.status,
          score: scoreForApi(payload.score),
          notes: notesForApi(payload.notes),
        }),
      );
    }

    if (payload.answers) {
      for (const q of questions) {
        const before = form.answers[q.id] ?? "";
        const after = payload.answers[q.id] ?? "";
        if (after !== before) {
          calls.push(selectionService.upsertAnswer(applicationId, q.id, after));
        }
      }
    }

    // Nota e observação da avaliação viajam juntas por questão — reenviar as
    // duas quando qualquer uma mudou é idempotente e evita rastrear as duas
    // separadamente por questão.
    if (payload.evalScores || payload.evalNotes) {
      for (const q of questions) {
        const scoreBefore = form.evalScores[q.id] ?? null;
        const scoreAfter = payload.evalScores
          ? (payload.evalScores[q.id] ?? null)
          : scoreBefore;
        const notesBefore = form.evalNotes[q.id] ?? null;
        const notesAfter = payload.evalNotes
          ? (payload.evalNotes[q.id] ?? null)
          : notesBefore;
        if (scoreAfter !== scoreBefore || notesAfter !== notesBefore) {
          calls.push(
            selectionService.upsertEvaluation(applicationId, q.id, {
              score: scoreForApi(scoreAfter),
              notes: notesForApi(notesAfter),
            }),
          );
        }
      }
    }

    await Promise.all(calls);
    const fresh = await selectionService.getApplicationDetail(applicationId);
    if (!fresh) return;
    onSaved(fresh);

    const freshResult = fresh.results?.find((r) => r.stageId === stage.id);
    const freshAnswers =
      fresh.answers?.filter((a) => a.question.stageId === stage.id) ?? [];
    const freshEvals =
      fresh.evaluations?.filter((e) => e.question.stageId === stage.id) ?? [];
    return buildForm(freshResult, questions, freshAnswers, freshEvals);
  };

  return (
    <div ref={containerRef} className="flex flex-col border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 px-4 py-3 bg-surface-raised hover:bg-surface transition-colors text-left"
      >
        {result ? (
          stageIcon(result.status)
        ) : (
          <Clock size={14} className="opacity-30" />
        )}
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

      {open &&
        (canEdit ? (
            <SectionCard
              label="Detalhes da etapa"
              editable
              values={form}
              onSave={handleSave}
            >
              {(ctx) =>
                ctx.editing ? (
                  <>
                    <Field label="Status">
                      <Select
                        value={ctx.values.status}
                        onValueChange={(v) => ctx.set("status", v)}
                      >
                        <SelectTrigger className={CAMPO} aria-label="Status da etapa">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RESULT_STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {STATUS_LABELS[s] ?? s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Nota">
                      <input
                        className={CAMPO}
                        inputMode="decimal"
                        value={ctx.values.score ?? ""}
                        onChange={(e) =>
                          ctx.set(
                            "score",
                            e.target.value === "" ? null : e.target.value,
                          )
                        }
                      />
                    </Field>
                    <Field label="Observação">
                      <textarea
                        className={`${CAMPO} min-h-20 py-2 resize-y`}
                        value={ctx.values.notes ?? ""}
                        onChange={(e) =>
                          ctx.set(
                            "notes",
                            e.target.value === "" ? null : e.target.value,
                          )
                        }
                      />
                    </Field>
                    {questions.length === 0 ? (
                      <p className="text-xs opacity-40 pt-2">
                        Esta etapa não tem questões cadastradas.
                      </p>
                    ) : (
                      questions.map((q) => (
                        <div
                          key={q.id}
                          className="flex flex-col gap-2 border-t border-border pt-3 mt-1"
                        >
                          <p className="text-xs font-semibold text-accent">
                            {q.order}. {q.title}
                          </p>
                          <Field label="Resposta do candidato">
                            <textarea
                              className={`${CAMPO} min-h-16 py-2 resize-y`}
                              value={ctx.values.answers[q.id] ?? ""}
                              onChange={(e) =>
                                ctx.set("answers", {
                                  ...ctx.values.answers,
                                  [q.id]: e.target.value,
                                })
                              }
                            />
                          </Field>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr]">
                            <Field
                              label={q.maxScore > 0 ? `Nota /${q.maxScore}` : "Nota"}
                            >
                              <input
                                className={CAMPO}
                                inputMode="decimal"
                                value={ctx.values.evalScores[q.id] ?? ""}
                                onChange={(e) =>
                                  ctx.set("evalScores", {
                                    ...ctx.values.evalScores,
                                    [q.id]:
                                      e.target.value === "" ? null : e.target.value,
                                  })
                                }
                              />
                            </Field>
                            <Field label="Observação da avaliação">
                              <input
                                className={CAMPO}
                                value={ctx.values.evalNotes[q.id] ?? ""}
                                onChange={(e) =>
                                  ctx.set("evalNotes", {
                                    ...ctx.values.evalNotes,
                                    [q.id]:
                                      e.target.value === "" ? null : e.target.value,
                                  })
                                }
                              />
                            </Field>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                ) : (
                  <StageReadOnly result={result} answers={answers} evals={evals} />
                )
              }
            </SectionCard>
        ) : (
          <div className="px-4 pb-4">
            <StageReadOnly result={result} answers={answers} evals={evals} />
          </div>
        ))}
    </div>
  );
}
