import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { StageResultItem } from "@/services/selection.service";

export function StageResultBadge({ result }: { result: StageResultItem }) {
  const icon =
    result.status === "PASSED" ? (
      <CheckCircle2 size={13} className="text-success" />
    ) : result.status === "FAILED" ? (
      <XCircle size={13} className="text-danger" />
    ) : (
      <Clock size={13} className="opacity-50" />
    );

  return (
    <div className="flex items-center gap-1.5 bg-surface border border-border rounded-block px-2.5 py-1.5">
      {icon}
      <div>
        <p className="text-xs font-semibold text-fg leading-none">
          {result.stage.title}
        </p>
        {result.score != null && (
          <p className="text-[10px] opacity-60 leading-none mt-0.5">
            {result.score} pts
          </p>
        )}
      </div>
    </div>
  );
}
