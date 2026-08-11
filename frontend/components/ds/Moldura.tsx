import { cn } from "@/lib/utils";

/**
 * A assinatura da marca: borda 3px, canto 20, preenchimento chapado e sombra
 * SÓLIDA deslocada — sem blur. Direto da página de Molduras do guia de estilos.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  OS TRÊS ÚNICOS USOS PERMITIDOS (spec §3.5)                  │
 * │                                                              │
 * │  1. Card de login          — shadow="magenta", estático      │
 * │  2. EmptyState com mascote — shadow="ciano",   estático      │
 * │  3. Card do PDI no perfil  — shadow="ciano",   interactive   │
 * │                                                              │
 * │  Máximo UM por tela. Nunca em elemento repetido de lista.     │
 * │  Um quarto uso exige decisão de design, não só um import.    │
 * └─────────────────────────────────────────────────────────────┘
 */
export function Moldura({
  shadow = "ciano",
  interactive = false,
  fill = "raised",
  className,
  children,
}: {
  shadow?: "ciano" | "magenta";
  interactive?: boolean;
  fill?: "raised" | "educational";
  className?: string;
  children: React.ReactNode;
}) {
  const shadowClass = shadow === "magenta"
    ? "shadow-[var(--moldura-desloc)_var(--moldura-desloc)_0_0_var(--danger)]"
    : "shadow-[var(--moldura-desloc)_var(--moldura-desloc)_0_0_var(--accent)]";

  const hoverNoneShadow = shadow === "magenta"
    ? "[@media(hover:none)]:hover:shadow-[var(--moldura-desloc)_var(--moldura-desloc)_0_0_var(--danger)]"
    : "[@media(hover:none)]:hover:shadow-[var(--moldura-desloc)_var(--moldura-desloc)_0_0_var(--accent)]";

  return (
    <div
      className={cn(
        "rounded-block border-[3px] border-fg",
        fill === "educational" ? "bg-educational text-fg-on-deep" : "bg-surface-raised",
        // A sombra ocupa espaço fora da caixa: o componente reserva o próprio
        // deslocamento para não sobrepor o vizinho nem ser cortado por um
        // ancestral com overflow-hidden.
        "mr-[var(--moldura-desloc)] mb-[var(--moldura-desloc)]",
        shadowClass,
        interactive && [
          "transition-[transform,box-shadow] duration-200",
          // O gesto: encaixa na própria sombra.
          "hover:translate-x-[var(--moldura-desloc)] hover:translate-y-[var(--moldura-desloc)] hover:shadow-none",
          "focus-visible:translate-x-[var(--moldura-desloc)] focus-visible:translate-y-[var(--moldura-desloc)] focus-visible:shadow-none",
          // Anel por FORA da sombra — ambos são ciano.
          "focus-visible:outline-offset-[10px]",
          // Sem ponteiro, o repouso mantém a sombra: colapsá-la esconderia
          // justamente o que define o componente (spec §3.5).
          "[@media(hover:none)]:hover:translate-x-0 [@media(hover:none)]:hover:translate-y-0",
          hoverNoneShadow,
          "motion-reduce:transition-none motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0",
        ],
        className
      )}
    >
      {children}
    </div>
  );
}
