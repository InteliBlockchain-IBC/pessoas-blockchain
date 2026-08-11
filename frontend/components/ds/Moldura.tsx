import { cn } from "@/lib/utils";

/**
 * STUB temporário — implementação completa chega na Task 7 (sombra
 * deslocada, gesto de encaixe, os 3 usos permitidos da spec §3.5). Este
 * stub existe só porque SectionCard.tsx (Task 6) precisa importar Moldura
 * antes dela existir de verdade — dependência para frente no plano.
 */
export function Moldura({
  className,
  children,
}: {
  shadow?: "ciano" | "magenta";
  interactive?: boolean;
  fill?: "raised" | "educational";
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(className)}>{children}</div>;
}
