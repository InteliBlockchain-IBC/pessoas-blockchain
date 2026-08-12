import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton com a forma da tabela real, para o layout não saltar quando os
 *  dados chegam. Substitui os `<p>Carregando…</p>` que existiam em 11 lugares. */
export function TableSkeleton({ columns, rows = 6 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-border last:border-b-0">
          {Array.from({ length: columns }).map((__, c) => (
            <td key={c} className="p-3">
              <Skeleton className="h-4 w-full max-w-32" /> {/* check-visual: ok — largura fixa é intencional para respeitar conteúdo */}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
