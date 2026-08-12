"use client";

import { cn } from "@/lib/utils";
import { TableSkeleton } from "./TableSkeleton";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

/**
 * A única tabela da plataforma. Absorve o antigo ui/Table.tsx e as DUAS tabelas
 * artesanais que viviam em admin/users e selection/[id].
 *
 * Canto 0, sem zebra (o contraste entre --surface e --surface-raised já basta,
 * e zebra briga com o fundo escuro — DESIGN_SYSTEM.md §7.5).
 *
 * rowKey é obrigatório de propósito: o Table anterior usava o índice do array,
 * o que fazia o React reaproveitar a linha errada ao filtrar a lista.
 */
export function DataTable<T>({
  columns,
  data,
  loading = false,
  empty,
  onRowClick,
  rowKey,
}: {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  empty?: React.ReactNode;
  onRowClick?: (item: T) => void;
  rowKey: (item: T) => string;
}) {
  return (
    // A rolagem horizontal fica contida aqui — o <body> nunca rola na
    // horizontal, em nenhuma largura.
    <div className="w-full overflow-x-auto border border-border">
      <table className="w-full border-collapse text-left text-sm"> {/* check-visual: ok — componente que centraliza a tabela */}
        <thead>
          <tr className="border-b border-border bg-surface-raised">
            {columns.map((c) => (
              <th key={c.key} className="whitespace-nowrap p-3" style={{ width: c.width }}>
                <span className="rotulo-em-card">{c.header}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-surface">
          {loading ? (
            <TableSkeleton columns={columns.length} />
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-0">
                {empty}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={rowKey(item)}
                {...(onRowClick
                  ? {
                      tabIndex: 0,
                      role: "button",
                      onClick: () => onRowClick(item),
                      onKeyDown: (e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(item);
                        }
                      },
                    }
                  : {})}
                className={cn(
                  "border-b border-border last:border-b-0",
                  onRowClick &&
                    "cursor-pointer transition-colors hover:bg-surface-raised focus-visible:bg-surface-raised focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring"
                )}
              >
                {columns.map((c) => (
                  <td key={c.key} className="p-3 text-fg">
                    {c.render ? c.render(item) : String((item as Record<string, unknown>)[c.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
