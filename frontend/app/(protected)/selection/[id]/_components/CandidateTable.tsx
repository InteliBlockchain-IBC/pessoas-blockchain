import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Application, Stage } from "@/services/selection.service";
import { DataTable, Column } from "@/components/ds/DataTable";
import { StatusBadge } from "@/components/ds/StatusBadge";
import { EmptyState } from "@/components/ds/EmptyState";
import { cn } from "@/lib/utils";
import { stageIcon, getScore, getStageStatus, getTotalScore } from "./helpers";

// ─── Constants ────────────────────────────────────────────────────────────────

type SortKey = "name" | "status" | "total" | string;
type SortDir = "asc" | "desc";

// Linha decorada com a posição pós-ordenação — DataTable.Column.render só
// recebe o item, não o índice (Task 10), então o índice vem pré-computado.
type Row = { app: Application; idx: number };

// ─── Sort Chip ────────────────────────────────────────────────────────────────
// DataTable.Column.header é `string` por contrato (Task 10) — não aceita um
// cabeçalho clicável com ícone. O controle de ordenação por coluna, que antes
// vivia no <th>, migra para esta fileira de chips acima da tabela (mesmo
// padrão visual dos pills de "Filtrar:" já usados nesta página). A lógica de
// ordenação (sortKey/sortDir/handleSort/sortedApps) não muda uma linha —
// só o lugar onde o clique acontece.
function SortChip({
  label,
  colKey,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string;
  colKey: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = sortKey === colKey;
  return (
    <button
      type="button"
      onClick={() => onSort(colKey)}
      className={cn(
        "flex items-center gap-1 rounded-field border px-3 py-1 text-xs font-bold whitespace-nowrap transition-colors",
        active
          ? "border-accent text-accent"
          : "border-border text-fg-muted hover:text-fg",
      )}
    >
      {label}
      {active ? (
        sortDir === "asc" ? (
          <ChevronUp size={13} />
        ) : (
          <ChevronDown size={13} />
        )
      ) : (
        <ChevronDown size={13} className="opacity-20" />
      )}
    </button>
  );
}

// ─── Candidate Table ──────────────────────────────────────────────────────────

export function CandidateTable({
  filteredApps,
  stages,
  loading,
  onSelectApp,
}: {
  filteredApps: Application[];
  stages: Stage[];
  loading: boolean;
  onSelectApp: (id: string) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Exclude stages where every question has maxScore=0 (e.g. Formulário de Inscrição)
  const scorableStages = useMemo(
    () =>
      stages.filter(
        (s) =>
          !(
            s.questions &&
            s.questions.length > 0 &&
            s.questions.every((q) => q.maxScore === 0)
          ),
      ),
    [stages],
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "total" || key.startsWith("stage:") ? "desc" : "asc");
    }
  };

  const sortedApps = useMemo(() => {
    return [...filteredApps].sort((a, b) => {
      let valA: number | string = "";
      let valB: number | string = "";

      if (sortKey === "name") {
        valA = a.member?.name ?? "";
        valB = b.member?.name ?? "";
      } else if (sortKey === "status") {
        valA = a.status;
        valB = b.status;
      } else if (sortKey === "total") {
        valA = getTotalScore(a) ?? -Infinity;
        valB = getTotalScore(b) ?? -Infinity;
      } else if (sortKey.startsWith("stage:")) {
        const sid = sortKey.replace("stage:", "");
        valA = getScore(a, sid) ?? -Infinity;
        valB = getScore(b, sid) ?? -Infinity;
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredApps, sortKey, sortDir]);

  const rows: Row[] = sortedApps.map((app, idx) => ({ app, idx }));

  const columns: Column<Row>[] = [
    {
      key: "idx",
      header: "#",
      width: "2.5rem",
      render: ({ idx }) => (
        <span className="font-mono text-xs opacity-40">{idx + 1}</span>
      ),
    },
    {
      key: "name",
      header: "Nome",
      render: ({ app }) => (
        <>
          <p className="font-semibold text-fg whitespace-nowrap">
            {app.member?.name ?? `ID: ${app.memberId.slice(0, 8)}`}
          </p>
          {app.member?.email && (
            <p className="text-xs opacity-40 whitespace-nowrap">
              {app.member.email}
            </p>
          )}
        </>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: ({ app }) => <StatusBadge status={app.status} />,
    },
    ...scorableStages.map(
      (stage): Column<Row> => ({
        key: `stage:${stage.id}`,
        header: stage.title,
        width: "150px",
        render: ({ app }) => {
          const score = getScore(app, stage.id);
          const st = getStageStatus(app, stage.id);
          return (
            <div className="flex items-center gap-1.5">
              {st !== "PENDING" && stageIcon(st)}
              <span
                className={
                  score != null
                    ? "font-mono font-semibold text-fg"
                    : "opacity-25 text-xs"
                }
              >
                {score != null ? score.toFixed(2) : "—"}
              </span>
            </div>
          );
        },
      }),
    ),
    {
      key: "total",
      header: "Total",
      render: ({ app }) => {
        const total = getTotalScore(app);
        return (
          <span
            className={
              total != null
                ? "font-mono font-bold text-accent"
                : "opacity-25 text-xs"
            }
          >
            {total != null ? total.toFixed(2) : "—"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs opacity-50 font-semibold uppercase tracking-wide">
          Ordenar:
        </span>
        <SortChip
          label="Nome"
          colKey="name"
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />
        <SortChip
          label="Status"
          colKey="status"
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />
        {scorableStages.map((stage) => (
          <SortChip
            key={stage.id}
            label={stage.title}
            colKey={`stage:${stage.id}`}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
          />
        ))}
        <SortChip
          label="Total"
          colKey="total"
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        rowKey={(r) => r.app.id}
        onRowClick={(r) => onSelectApp(r.app.id)}
        empty={
          <EmptyState
            title="Nenhum candidato encontrado"
            description="Ajuste os filtros ou importe uma planilha de candidatos para este processo."
          />
        }
      />
    </div>
  );
}
