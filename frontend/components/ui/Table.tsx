import React from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T>({ columns, data, emptyMessage = "Nenhum dado disponível", onRowClick }: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-block border border-border">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-raised border-b border-border">
            {columns.map((col) => (
              <th key={col.key} className="p-4 font-heading font-bold text-sm text-fg whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-surface">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-fg-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(item)}
                className={`border-b border-border last:border-b-0 ${onRowClick ? "cursor-pointer hover:bg-surface-raised transition-colors" : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="p-4 text-fg whitespace-nowrap">
                    {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
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
