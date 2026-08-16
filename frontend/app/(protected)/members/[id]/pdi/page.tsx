"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Save, FileText, Eye, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/ds/PageHeader";
import { MarkdownEditor } from "@/components/ds/MarkdownEditor";
import { MarkdownViewer } from "@/components/ds/MarkdownViewer";
import { notificar } from "@/components/ds/toast-helpers";
import { useDirtySections } from "@/components/ds/DirtyGuard";
import { pdiService, PdiEntry } from "@/services/pdi.service";

const DEFAULT_CONTENT =
  "# Meu Plano de Desenvolvimento Individual\n\n## Metas do Semestre\n- \n\n## Pontos Fortes\n- \n\n## Áreas de Desenvolvimento\n- \n";

export default function PDIPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const memberId = resolvedParams.id;
  const router = useRouter();

  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [currentPdi, setCurrentPdi] = useState<PdiEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingPdi, setLoadingPdi] = useState(true);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Preview modal
  const [previewModal, setPreviewModal] = useState<"pdf" | "csv" | null>(null);
  const [exporting, setExporting] = useState(false);

  const { registrar } = useDirtySections();
  useEffect(() => {
    registrar("pdi", hasUnsaved);
    return () => registrar("pdi", false);
  }, [hasUnsaved, registrar]);

  // Load existing PDI
  useEffect(() => {
    pdiService
      .getPdis(memberId)
      .then((pdis) => {
        const active = pdis.find((p) => p.isActive) ?? pdis[0] ?? null;
        if (active) {
          setCurrentPdi(active);
          setContent(active.content);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPdi(false));
  }, [memberId]);

  const handleContentChange = (val: string) => {
    setContent(val);
    setHasUnsaved(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (currentPdi) {
        const updated = await pdiService.updatePdi(currentPdi.id, currentPdi.title, content);
        if (updated) setCurrentPdi(updated);
      } else {
        const result = await pdiService.savePdi(
          memberId,
          "Plano de Desenvolvimento Individual",
          content,
        );
        setCurrentPdi(result ?? null);
      }
      setHasUnsaved(false);
      notificar.sucesso("PDI salvo");
    } catch {
      notificar.erro("Não foi possível salvar o PDI", "Verifique suas permissões.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await pdiService.exportPDF(memberId);
    } catch {
      notificar.erro("Não foi possível exportar o PDF");
    } finally {
      setExporting(false);
      setPreviewModal(null);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await pdiService.exportCSV(memberId);
    } catch {
      notificar.erro("Não foi possível exportar o histórico");
    } finally {
      setExporting(false);
      setPreviewModal(null);
    }
  };

  const subtitle = currentPdi
    ? `Última edição: ${new Date(currentPdi.updatedAt).toLocaleDateString("pt-BR")}`
    : "Nenhum PDI salvo ainda.";

  return (
    <div className="space-y-8">
      <PageHeader
        label="PDI"
        title="Plano de Desenvolvimento Individual"
        subtitle={subtitle}
        onBack={() => router.push(`/members/${memberId}`)}
        actions={
          <>
            <Button variant="outline" onClick={() => setPreviewModal("csv")}>
              <Eye size={18} aria-hidden="true" />
              Exportar Histórico
            </Button>
            <Button variant="outline" onClick={() => setPreviewModal("pdf")}>
              <Eye size={18} aria-hidden="true" />
              Exportar Ficha (PDF)
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              ) : (
                <Save size={18} aria-hidden="true" />
              )}
              Salvar PDI
            </Button>
          </>
        }
      />

      {/* Unsaved indicator */}
      {hasUnsaved && (
        <div className="flex items-center gap-2 rounded-block border border-warning/40 bg-warning/20 px-3 py-2 text-xs text-warning">
          <AlertTriangle size={14} aria-hidden="true" />
          Alterações não salvas — clique em &quot;Salvar PDI&quot; para persistir.
        </div>
      )}

      {/* Editor */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Editar PDI (Suporta Markdown)</h2>
        {loadingPdi ? (
          <div className="flex h-48 items-center justify-center gap-2 text-sm opacity-50">
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            Carregando PDI...
          </div>
        ) : (
          <MarkdownEditor
            value={content}
            onChange={handleContentChange}
            placeholder="Suporta Markdown (ex. **negrito**, - lista)"
          />
        )}
      </div>

      {/* ── PDF Preview Dialog ─────────────────────────────────────────── */}
      <Dialog open={previewModal === "pdf"} onOpenChange={(open) => !open && setPreviewModal(null)}>
        <DialogContent className="sm:max-w-2xl"> {/* check-visual: ok — largura do dialog, não da página */}
          <DialogHeader>
            <DialogTitle>Pré-visualização — Ficha PDF</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-5">
            <div className="rounded-block border border-border px-3 py-2 text-xs opacity-60">
              O PDF exportado conterá informações demográficas do membro, este PDI
              e o histórico do processo seletivo. Abaixo, a pré-visualização do
              conteúdo do PDI:
            </div>

            <div className="max-h-[50vh] overflow-y-auto rounded-field border border-border bg-surface p-5">
              <MarkdownViewer content={content} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPreviewModal(null)}>
              Cancelar
            </Button>
            <Button onClick={handleExportPDF} disabled={exporting}>
              <FileText size={16} aria-hidden="true" />
              {exporting ? "Exportando..." : "Confirmar e baixar PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── CSV Preview Dialog ─────────────────────────────────────────── */}
      <Dialog open={previewModal === "csv"} onOpenChange={(open) => !open && setPreviewModal(null)}>
        <DialogContent className="sm:max-w-md"> {/* check-visual: ok — largura do dialog, não da página */}
          <DialogHeader>
            <DialogTitle>Pré-visualização — Exportar Histórico CSV</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 text-sm text-fg">
              <p className="opacity-70">
                O arquivo CSV conterá o histórico completo de revisões do PDI deste membro,
                incluindo data, editor e conteúdo de cada versão.
              </p>
              <div className="rounded-block border border-border bg-surface px-4 py-3 font-mono text-xs opacity-80">
                <p className="mb-1 font-semibold text-fg">Colunas do CSV:</p>
                <p>id, memberId, title, content, editor, createdAt</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPreviewModal(null)}>
              Cancelar
            </Button>
            <Button onClick={handleExportCSV} disabled={exporting}>
              <Download size={16} aria-hidden="true" />
              {exporting ? "Exportando..." : "Confirmar e baixar CSV"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
