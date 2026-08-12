import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Application, Stage } from "@/services/selection.service";
import { Badge } from "@/components/ui/Badge";
import {
  APP_STATUS_LABEL,
  stageIcon,
  getScore,
  getStageStatus,
  getTotalScore,
} from "./helpers";

// ─── Constants ────────────────────────────────────────────────────────────────

type SortKey = "name" | "status" | "total" | string;
type SortDir = "asc" | "desc";

// ─── Sort Header ──────────────────────────────────────────────────────────────

function SortHeader({
  label,
  colKey,
  sortKey,
  sortDir,
  onSort,
  className = "",
}: {
  label: string;
  colKey: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === colKey;
  return (
    <th
      onClick={() => onSort(colKey)}
      className={`p-3 text-left font-bold text-fg whitespace-nowrap cursor-pointer select-none hover:bg-surface transition-colors ${className}`}
    >
      <div className="flex items-center gap-1">
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
      </div>
    </th>
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

  return loading ? (
    <div className="bg-surface-raised border border-border p-6 rounded-block w-full min-h-[400px] flex items-center justify-center">
      <p className="opacity-60">Carregando candidatos...</p>
    </div>
  ) : (
    <div className="w-full overflow-x-auto rounded-block border border-border">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-surface-raised border-b border-border">
            <th className="p-3 font-bold text-fg w-10 opacity-50">#</th>
            <SortHeader
              label="Nome"
              colKey="name"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
            />
            <SortHeader
              label="Status"
              colKey="status"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
            />
            {scorableStages.map((stage) => (
              <SortHeader
                key={stage.id}
                label={stage.title}
                colKey={`stage:${stage.id}`}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="min-w-[150px]"
              />
            ))}
            <SortHeader
              label="Total"
              colKey="total"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
            />
          </tr>
        </thead>
        <tbody className="bg-surface">
          {sortedApps.length === 0 ? (
            <tr>
              <td
                colSpan={4 + scorableStages.length + 1}
                className="p-8 text-center text-fg opacity-60"
              >
                Nenhum candidato encontrado.
              </td>
            </tr>
          ) : (
            sortedApps.map((app, idx) => {
              const total = getTotalScore(app);
              return (
                <tr
                  key={app.id}
                  onClick={() => onSelectApp(app.id)}
                  className="border-b border-border last:border-b-0 hover:bg-surface-raised transition-colors cursor-pointer"
                >
                  <td className="p-3 text-fg opacity-40 font-mono text-xs">
                    {idx + 1}
                  </td>

                  <td className="p-3">
                    <p className="font-semibold text-fg whitespace-nowrap">
                      {app.member?.name ??
                        `ID: ${app.memberId.slice(0, 8)}`}
                    </p>
                    {app.member?.email && (
                      <p className="text-xs opacity-40 whitespace-nowrap">
                        {app.member.email}
                      </p>
                    )}
                  </td>

                  <td className="p-3">
                    <Badge status={app.status} label={APP_STATUS_LABEL[app.status] ?? app.status} />
                  </td>

                  {scorableStages.map((stage) => {
                    const score = getScore(app, stage.id);
                    const st = getStageStatus(app, stage.id);
                    return (
                      <td key={stage.id} className="p-3">
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
                      </td>
                    );
                  })}

                  <td className="p-3">
                    <span
                      className={
                        total != null
                          ? "font-mono font-bold text-accent"
                          : "opacity-25 text-xs"
                      }
                    >
                      {total != null ? total.toFixed(2) : "—"}
                    </span>
                  </td>

                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
