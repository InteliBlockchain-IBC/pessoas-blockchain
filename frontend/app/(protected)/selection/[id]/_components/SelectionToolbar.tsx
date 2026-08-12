import { useState } from "react";
import { Download, Upload } from "lucide-react";
import { selectionService, Application } from "@/services/selection.service";
import { Button } from "@/components/ui/button";
import { notificar } from "@/components/ds/toast-helpers";

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
      notificar.erro("Erro ao exportar resultados.");
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
          notificar.sucesso("Candidatos importados com sucesso!");
        } catch {
          notificar.erro("Erro ao importar candidatos.");
        } finally {
          setImporting(false);
        }
      }
    };
    fileInput.click();
  };

  return (
    <>
      <Button variant="outline" onClick={handleImportClick} disabled={importing}>
        <Upload size={18} />
        {importing ? "Importando..." : "Importar"}
      </Button>

      <Button onClick={handleExportCSV}>
        <Download size={18} />
        Exportar CSV
      </Button>
    </>
  );
}
