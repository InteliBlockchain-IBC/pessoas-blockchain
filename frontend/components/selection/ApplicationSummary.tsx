"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionCard } from "@/components/ds/SectionCard";
import { Field } from "@/components/ds/Field";
import { StatusBadge, STATUS_LABELS } from "@/components/ds/StatusBadge";
import {
  selectionService,
  Application,
  Stage,
} from "@/services/selection.service";
import {
  StageRail,
  railStagesFromResults,
  railStagesFromStages,
} from "./StageRail";
import { getTotalScore, CAMPO } from "./helpers";

const STATUS_OPTIONS = [
  "DRAFT",
  "SUBMITTED",
  "IN_REVIEW",
  "APPROVED",
  "REJECTED",
  "WITHDRAWN",
];

interface CandidacyForm {
  status: string;
  notes: string | null;
}

export interface ApplicationSummaryProps {
  application: Application;
  canEdit: boolean;
  /** Presente só quando o chamador já tem o processo inteiro em memória
   * (/selection/[id]) — a trilha então inclui etapas sem resultado. Ausente
   * no perfil, que não carrega o processo inteiro. */
  stages?: Stage[];
  activeStageId?: string;
  onSelectStage?: (id: string) => void;
  /** Chamado com a Application inteira, recém-buscada, após salvar. */
  onSaved: (app: Application) => void;
}

export function ApplicationSummary({
  application,
  canEdit,
  stages,
  activeStageId,
  onSelectStage,
  onSaved,
}: ApplicationSummaryProps) {
  const form: CandidacyForm = {
    status: application.status,
    notes: application.notes,
  };
  const totalScore = getTotalScore(application);
  const railStages = stages
    ? railStagesFromStages(stages, application.results)
    : railStagesFromResults(application.results);

  const handleSave = async (
    payload: Partial<CandidacyForm>,
  ): Promise<CandidacyForm | void> => {
    // O DTO exige `status`; manda o valor corrente mesmo quando só a
    // observação mudou.
    await selectionService.updateApplicationStatus(
      application.id,
      payload.status ?? application.status,
      payload.notes,
    );
    const fresh = await selectionService.getApplicationDetail(application.id);
    if (!fresh) return;
    onSaved(fresh);
    return { status: fresh.status, notes: fresh.notes };
  };

  const notesReadOnly = application.notes && (
    <p className="text-xs text-fg opacity-70 whitespace-pre-wrap">
      {application.notes}
    </p>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-semibold text-fg">
          {application.process?.name ?? "Processo desconhecido"}
          {application.process?.year && (
            <span className="text-xs font-normal opacity-60 ml-2">
              ({application.process.year})
            </span>
          )}
        </span>
        <StatusBadge status={application.status} />
        {totalScore != null && (
          <span className="ml-auto text-sm font-bold text-accent">
            Total: {totalScore.toFixed(2)} pts
          </span>
        )}
      </div>

      <StageRail
        stages={railStages}
        activeStageId={activeStageId}
        onSelect={onSelectStage}
      />

      {canEdit ? (
        <SectionCard
          label="Candidatura"
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
                    <SelectTrigger className={CAMPO} aria-label="Status da candidatura">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s] ?? s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Observações gerais">
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
              </>
            ) : (
              notesReadOnly
            )
          }
        </SectionCard>
      ) : (
        notesReadOnly
      )}
    </div>
  );
}
