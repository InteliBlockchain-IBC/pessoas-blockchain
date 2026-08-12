import Image from "next/image";
import { Ban, Inbox, TriangleAlert } from "lucide-react";
import { Moldura } from "./Moldura";

/**
 * Estado vazio, negado e de erro. Substitui as 3 cópias de AccessDenied e os
 * `<p>Nenhum … encontrado</p>` espalhados.
 *
 * `mascot` é a PRIMEIRA aparição do mascote na plataforma — o
 * DESIGN_SYSTEM.md §5.3 o reserva para estado vazio, boas-vindas e erro, e até
 * aqui ele não aparecia em nenhum pixel.
 *
 * A Moldura acompanha o mascote, não o estado vazio: senão toda tabela sem
 * resultado viraria assinatura da marca (spec §3.5, uso 2).
 */
const PADRAO = { empty: Inbox, denied: Ban, error: TriangleAlert };

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "empty",
  mascot = false,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: "empty" | "denied" | "error";
  mascot?: boolean;
}) {
  const Ico = Icon ?? PADRAO[tone];

  const corpo = (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      {mascot ? (
        <Image
          src="/mascote.png"
          alt=""
          role="presentation"
          aria-hidden="true"
          width={512}
          height={512}
          className="mb-2 h-32 w-auto"
        />
      ) : (
        <Ico className="h-10 w-10 text-fg-subtle" aria-hidden="true" />
      )}
      <h3 className="font-heading text-lg font-bold text-fg">{title}</h3>
      {description && (
        <p className="max-w-md text-sm text-fg-muted">{/* check-visual: ok — legibilidade do parágrafo (72 caracteres), não largura de página */}{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );

  return mascot ? <Moldura shadow="ciano">{corpo}</Moldura> : corpo;
}
