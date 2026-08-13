// Barril de compatibilidade: a implementação real mudou para
// frontend/components/selection/helpers.tsx (usada também por StageBlock e
// ApplicationSummary, compartilhados com members/[id]/_components/ApplicationCard).
// CandidateTable.tsx continua importando daqui — sem motivo pra tocar nela só
// por causa da unificação do PS.
export {
  stageIcon,
  getScore,
  getStageStatus,
  getTotalScore,
} from "@/components/selection/helpers";
