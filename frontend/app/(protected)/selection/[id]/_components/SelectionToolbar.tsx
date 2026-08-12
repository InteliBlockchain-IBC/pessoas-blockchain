import { useState } from "react";
import { Download, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { selectionService, Application } from "@/services/selection.service";

// ─── Selection Toolbar ────────────────────────────────────────────────────────

export function SelectionToolbar({
  processId,
  onImported,
}: {
  processId: string;
  onImported: (apps: Application[]) => void;
}) {
  const [importing, setImporting] = useState(false);

  const handleExportCSV = async () => {
    try {
      await selectionService.exportCSV(processId);
    } catch {
      alert("Erro ao exportar resultados.");
    }
  };

  const handleImportClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xlsx, .csv";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setImporting(true);
        try {
          const apps = await selectionService.importCandidates(
            processId,
            file,
          );
          onImported(apps);
          alert("Candidatos importados com sucesso!");
        } catch {
          alert("Erro ao importar candidatos.");
        } finally {
          setImporting(false);
        }
      }
    };
    fileInput.click();
  };

  return (
    <div className="flex gap-3">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleImportClick}
        disabled={importing}
        className="font-heading font-bold rounded-block transition-all bg-transparent text-accent border border-accent hover:bg-surface-raised disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-6 py-2"
      >
        <Upload size={18} />
        {importing ? "Importando..." : "Importar"}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleExportCSV}
        className="font-heading font-bold rounded-block transition-all bg-accent text-accent-fg hover:bg-accent-hover flex items-center gap-2 px-6 py-2"
      >
        <Download size={18} />
        Exportar CSV
      </motion.button>
    </div>
  );
}
