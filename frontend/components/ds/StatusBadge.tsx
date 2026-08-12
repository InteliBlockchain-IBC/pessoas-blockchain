// Único lugar que decide a aparência de um estado. Antes desta versão, cinco
// páginas mantinham cada uma o seu mapa de STATUS -> className, com cores da
// paleta padrão do Tailwind que não pertencem ao design system.
//
// Política (DESIGN_SYSTEM.md §7.4): cor só onde há ação. Sucesso, aviso e erro
// têm cor; todo o resto é neutro. Departamento NÃO é badge — é texto com ícone.

import type { ReactNode } from "react";

export type BadgeTone = "success" | "warning" | "danger" | "neutral";

const TONE_BY_STATUS: Record<string, BadgeTone> = {
  // UserStatus, ApplicationStatus, MeetingRequestStatus
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "danger",
  IN_REVIEW: "warning",
  DRAFT: "neutral",
  SUBMITTED: "neutral",
  WITHDRAWN: "neutral",
  // MemberStatus
  ACTIVE: "success",
  CANDIDATE: "neutral",
  INACTIVE: "neutral",
  ALUMNI: "neutral",
  // StageResultStatus
  PASSED: "success",
  FAILED: "danger",
  SKIPPED: "neutral",
  // MeetingStatus
  SCHEDULED: "success",
  COMPLETED: "success",
  CANCELED: "danger",
};

export const STATUS_LABELS: Record<string, string> = {
  APPROVED: "Aprovado",
  PENDING: "Pendente",
  REJECTED: "Rejeitado",
  IN_REVIEW: "Em análise",
  DRAFT: "Rascunho",
  SUBMITTED: "Enviado",
  WITHDRAWN: "Retirado",
  ACTIVE: "Ativo",
  CANDIDATE: "Candidato",
  INACTIVE: "Inativo",
  ALUMNI: "Alumni",
  PASSED: "Aprovado",
  FAILED: "Reprovado",
  SKIPPED: "Pulado",
  SCHEDULED: "Agendado",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
};

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-success text-fg-on-bright",
  warning: "bg-warning text-fg-on-bright",
  danger: "bg-danger-surface text-fg-on-deep",
  // Neutro usa --border-interactive, não --border: --border sobre --surface dá
  // 2,05:1, abaixo do mínimo de 3:1 para elemento de interface.
  neutral: "bg-transparent text-fg-muted border border-border-interactive",
};

export interface StatusBadgeProps {
  status: string;
  /** Sobrescreve o rótulo padrão. Ignorado se houver `children`. */
  label?: string;
  /** Para conteúdo com marcação, como "Ativos: <strong>12</strong>". */
  children?: ReactNode;
  className?: string;
}

export function StatusBadge({ status, label, children, className = "" }: StatusBadgeProps) {
  const tone = TONE_BY_STATUS[status] ?? "neutral";
  const content = children ?? label ?? STATUS_LABELS[status] ?? status;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-3 py-1 font-heading text-xs font-bold whitespace-nowrap ${TONE_CLASSES[tone]} ${className}`}
    >
      {content}
    </span>
  );
}
