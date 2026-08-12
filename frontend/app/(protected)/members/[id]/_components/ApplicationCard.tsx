import { useState } from "react";
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ds/StatusBadge";
import { Application } from "@/services/selection.service";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { APPLICATION_STATUS_LABEL } from "@/lib/labels";
import { StageResultBadge } from "./StageResultBadge";
import { ApplicationDetail } from "./ApplicationDetail";

// ─── Application card with expandable detail ───────────────────────────────────

export function ApplicationCard({ app }: { app: Application }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-3 p-4 bg-surface border border-border rounded-block">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-fg">
            {app.process?.name ?? "Processo desconhecido"}
            {app.process?.year && (
              <span className="text-xs font-normal opacity-60 ml-2">
                ({app.process.year})
              </span>
            )}
          </p>
          {app.notes && (
            <p className="text-xs opacity-60 mt-0.5">{app.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={app.status} label={APPLICATION_STATUS_LABEL[app.status] ?? app.status} />
          <button
            onClick={() => router.push(`/selection/${app.processId}`)}
            className="text-xs text-accent hover:underline flex items-center gap-0.5"
          >
            Ver processo <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {app.results && app.results.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {app.results.map((r) => (
            <StageResultBadge key={r.id} result={r} />
          ))}
        </div>
      )}

      <button
        onClick={() => setExpanded((v) => !v)}
        className="self-start flex items-center gap-1 text-xs font-semibold text-fg-muted hover:text-fg transition-all"
      >
        {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        {expanded ? "Ver menos" : "Ver mais"}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ApplicationDetail appId={app.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
