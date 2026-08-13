"use client";

import {
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { selectionService, SelectionProcess, Stage } from "@/services/selection.service";
import { StatusBadge } from "@/components/ds/StatusBadge";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ds/PageHeader";
import { SectionCard } from "@/components/ds/SectionCard";
import { EmptyState } from "@/components/ds/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

// ─── Stages content (rendered inside card) ────────────────────────────────────

function ProcessStages({ processId }: { processId: string }) {
  const [detail, setDetail] = useState<SelectionProcess | null>(null);
  const [loading, setLoading] = useState(true);
  const [openStages, setOpenStages] = useState<Set<string>>(new Set());

  useEffect(() => {
    selectionService
      .getProcess(processId)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [processId]);

  const toggleStage = (id: string) =>
    setOpenStages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const stages: Stage[] = detail?.stages ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 size={18} className="animate-spin opacity-40" />
      </div>
    );
  }

  if (!detail) {
    return (
      <p className="text-xs opacity-50 text-center py-4">
        Não foi possível carregar.
      </p>
    );
  }

  if (stages.length === 0) {
    return (
      <p className="text-xs opacity-40 text-center py-4">
        Nenhuma etapa cadastrada.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {stages.map((stage, si) => {
        const isOpen = openStages.has(stage.id);
        const questions = stage.questions ?? [];
        const totalScore = questions.reduce((acc, q) => acc + (q.maxScore ?? 0), 0);

        return (
          <div key={stage.id}>
            <button
              onClick={() => toggleStage(stage.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-field hover:bg-surface transition-colors text-left"
            >
              <span className="text-xs font-mono opacity-30 w-5 shrink-0">
                {si + 1}.
              </span>
              <span className="font-semibold text-fg text-sm flex-1">
                {stage.title}
              </span>
              {questions.length > 0 && (
                <span className="text-xs opacity-40 shrink-0">
                  {questions.length} questão{questions.length !== 1 ? "ões" : ""}
                  {totalScore > 0 && ` · ${totalScore} pts`}
                </span>
              )}
              {isOpen ? (
                <ChevronDown size={13} className="opacity-40 shrink-0" />
              ) : (
                <ChevronRight size={13} className="opacity-40 shrink-0" />
              )}
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.14 }}
                  className="overflow-hidden"
                >
                  {questions.length === 0 ? (
                    <p className="text-xs opacity-30 px-11 pb-2">
                      Sem questões cadastradas.
                    </p>
                  ) : (
                    <div className="flex flex-col pl-11 pb-2">
                      {questions.map((q, qi) => (
                        <div
                          key={q.id}
                          className="flex items-start gap-2 py-1.5 border-l-2 border-border/30 pl-3"
                        >
                          <span className="text-xs font-mono opacity-25 shrink-0 w-5 mt-0.5">
                            {qi + 1}.
                          </span>
                          <p className="text-sm text-fg flex-1 leading-snug">
                            {q.title}
                          </p>
                          {q.maxScore > 0 && (
                            <span className="text-xs font-semibold text-accent shrink-0">
                              {q.maxScore} pts
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Process card ─────────────────────────────────────────────────────────────

function ProcessCard({ process }: { process: SelectionProcess }) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  return (
    <SectionCard label="PROCESSO" values={{}}>
      {() => (
        <div className="flex flex-col gap-4">
          {/* Linha principal */}
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
              <span className="font-bold text-fg">{process.name}</span>
              <StatusBadge status={process.isActive ? "ACTIVE" : "CLOSED"} label={process.isActive ? "Ativo" : "Encerrado"} />
              <span className="text-xs text-fg-muted">{process.year}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" onClick={() => router.push(`/selection/${process.id}`)}>
                <ExternalLink size={13} />
                Candidatos
              </Button>

              <Button variant="outline" size="sm" onClick={() => setExpanded((v) => !v)}>
                {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                Ver mais
              </Button>
            </div>
          </div>

          {/* Expansão inline dentro do mesmo card */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-border">
                  <ProcessStages processId={process.id} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </SectionCard>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SelectionPage() {
  const [processes, setProcesses] = useState<SelectionProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const canAccess = user?.role === "ADMIN" || user?.role === "PEOPLE";

  const fetchProcesses = useCallback(async () => {
    try {
      const data = await selectionService.getProcesses();
      setProcesses(data);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) setError("Sem permissão para acessar processos seletivos.");
      else setError("Erro ao carregar processos. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- dispara a busca inicial assim que canAccess resolve
    if (canAccess) fetchProcesses();
    else setLoading(false);
  }, [canAccess, fetchProcesses]);

  if (!canAccess) {
    return (
      <EmptyState
        tone="denied"
        title="Acesso restrito"
        description="Esta seção é exclusiva para membros da diretoria de Pessoas (ADMIN e PEOPLE)."
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        label="SELEÇÃO"
        title="Processos Seletivos"
        subtitle={
          !loading
            ? `${processes.length} processo${processes.length !== 1 ? "s" : ""}`
            : undefined
        }
        icon={ClipboardList}
      />

      {loading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <EmptyState tone="error" title="Erro ao carregar processos" description={error} />
      ) : processes.length === 0 ? (
        <EmptyState
          title="Nenhum processo seletivo encontrado"
          description="Quando um processo seletivo for criado, ele aparece aqui."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {processes.map((p) => (
            <ProcessCard key={p.id} process={p} />
          ))}
        </div>
      )}
    </div>
  );
}
