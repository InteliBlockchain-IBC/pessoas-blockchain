"use client";

import { Users, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useState, useEffect, use, useMemo } from "react";
import {
  selectionService,
  Application,
  SelectionProcess,
  Stage,
} from "@/services/selection.service";
import { useRouter } from "next/navigation";
import { CandidateDetailModal } from "./_components/CandidateDetailModal";
import { CandidateTable } from "./_components/CandidateTable";
import { SelectionToolbar } from "./_components/SelectionToolbar";
import { PageHeader } from "@/components/ds/PageHeader";
import { KpiRow } from "@/components/ds/KpiRow";
import { KpiCard } from "@/components/ds/KpiCard";
import { EmptyState } from "@/components/ds/EmptyState";
import { STATUS_LABELS } from "@/components/ds/StatusBadge";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SelectionProcessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const processId = resolvedParams.id;
  const router = useRouter();

  const [process, setProcess] = useState<SelectionProcess | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [proc, apps] = await Promise.all([
          selectionService.getProcess(processId),
          selectionService.getApplications(processId),
        ]);
        setProcess(proc);
        setStages(proc?.stages ?? []);
        setApplications(apps);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [processId]);

  const filteredApps = useMemo(
    () =>
      statusFilter
        ? applications.filter((a) => a.status === statusFilter)
        : applications,
    [applications, statusFilter],
  );

  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  useEffect(() => {
    // localStorage só existe no cliente — SSR-safe (CLAUDE.md, regra técnica 2).
    const role = localStorage.getItem("x-user-role") ?? "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanAccess(role === "ADMIN" || role === "PEOPLE");
  }, []);

  const approvedCount = applications.filter(
    (a) => a.status === "APPROVED",
  ).length;
  const rejectedCount = applications.filter(
    (a) => a.status === "REJECTED",
  ).length;
  const inReviewCount = applications.filter(
    (a) => a.status === "IN_REVIEW",
  ).length;

  if (canAccess === null) return null;
  if (!canAccess) {
    return (
      <EmptyState
        tone="denied"
        title="Acesso restrito"
        description="Esta seção é exclusiva para membros da diretoria de Pessoas."
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        label="PROCESSO"
        title={process?.name ?? "Processo Seletivo"}
        subtitle={
          process
            ? `${process.year} · ${applications.length} candidato${applications.length !== 1 ? "s" : ""}`
            : undefined
        }
        onBack={() => router.push("/selection")}
        actions={
          <SelectionToolbar processId={processId} onImported={setApplications} />
        }
      />

      <KpiRow>
        <KpiCard hero icon={Users} label="Total" value={applications.length} loading={loading} />
        <KpiCard icon={CheckCircle2} label="Aprovados" value={approvedCount} tone="success" loading={loading} />
        <KpiCard icon={XCircle} label="Reprovados" value={rejectedCount} tone="danger" loading={loading} />
        <KpiCard icon={Clock} label="Em análise" value={inReviewCount} tone="warning" loading={loading} />
      </KpiRow>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs opacity-50 font-semibold uppercase tracking-wide">
          Filtrar:
        </span>
        {["", "APPROVED", "REJECTED", "IN_REVIEW", "SUBMITTED"].map((s) => {
          const count =
            s === ""
              ? applications.length
              : applications.filter((a) => a.status === s).length;
          if (s !== "" && count === 0) return null;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-field text-xs font-bold border transition-colors ${
                statusFilter === s
                  ? "border-accent text-accent"
                  : "border-border text-fg-muted hover:text-fg"
              }`}
            >
              {s === "" ? "Todos" : (STATUS_LABELS[s] ?? s)} ({count})
            </button>
          );
        })}
      </div>

      {/* Spreadsheet */}
      <CandidateTable
        filteredApps={filteredApps}
        stages={stages}
        loading={loading}
        onSelectApp={setSelectedAppId}
      />

      {/* Detail Modal */}
      {selectedAppId && (
        <CandidateDetailModal
          appId={selectedAppId}
          stages={stages}
          onClose={() => setSelectedAppId(null)}
        />
      )}
    </div>
  );
}
