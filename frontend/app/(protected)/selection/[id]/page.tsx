"use client";

import { ArrowLeft, ClipboardList } from "lucide-react";
import { useState, useEffect, use, useMemo } from "react";
import {
  selectionService,
  Application,
  SelectionProcess,
  Stage,
} from "@/services/selection.service";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CandidateDetailModal } from "./_components/CandidateDetailModal";
import { CandidateTable } from "./_components/CandidateTable";
import { SelectionToolbar } from "./_components/SelectionToolbar";
import { APP_STATUS_LABEL } from "./_components/helpers";

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

  if (canAccess === null) return null;
  if (!canAccess) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <ClipboardList size={48} className="opacity-20" />
        <h2 className="text-xl font-bold text-fg">Acesso restrito</h2>
        <p className="text-sm opacity-60 max-w-sm">
          Esta seção é exclusiva para membros da diretoria de Pessoas.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 w-full max-w-full mx-auto flex flex-col gap-6"
    >
      {/* Back */}
      <button
        onClick={() => router.push("/selection")}
        className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors w-fit"
      >
        <ArrowLeft size={15} />
        Processos Seletivos
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <ClipboardList
            size={32}
            className="text-accent"
          />
          <div>
            <h1 className="font-bold text-fg">
              {process?.name ?? "Processo Seletivo"}
            </h1>
            {process && (
              <p className="text-sm opacity-60 mt-0.5">
                {process.year} · {applications.length} candidato
                {applications.length !== 1 ? "s" : ""} ·{" "}
                <span className="text-success">
                  {approvedCount} aprovado{approvedCount !== 1 ? "s" : ""}
                </span>
                {rejectedCount > 0 && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="text-danger">
                      {rejectedCount} reprovado{rejectedCount !== 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        <SelectionToolbar processId={processId} onImported={setApplications} />
      </div>

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
              {s === "" ? "Todos" : (APP_STATUS_LABEL[s] ?? s)} ({count})
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
    </motion.div>
  );
}
