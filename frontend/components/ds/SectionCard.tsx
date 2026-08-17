"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Pencil, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { notificar } from "./toast-helpers";
import { montarPayload } from "./section-payload";
import { useDirtySections } from "./DirtyGuard";

/**
 * Seção com edição própria. Substitui o booleano `editing` de página inteira
 * que existia em members/[id]: lá, um único estado virava TODOS os cards em
 * formulário ao mesmo tempo, e o AnimatePresence mode="wait" fazia o layout
 * colapsar e re-expandir a cada troca.
 *
 * Aqui não há AnimatePresence: DataRow e Field compartilham LINHA_ALTURA, então
 * a troca não muda a altura do card. Ver spec §7.3.
 *
 * Em caso de erro a seção PERMANECE em edição com o rascunho intacto. Perder o
 * que o usuário digitou por causa de um 403 é o pior resultado possível aqui.
 */
export function SectionCard<T extends object>({
  label,
  values,
  editable = false,
  onSave,
  children,
  className,
}: {
  label: string;
  values: T;
  editable?: boolean;
  onSave?: (payload: Partial<T>) => Promise<T | void>;
  children: (ctx: {
    editing: boolean;
    values: T;
    set: <K extends keyof T>(k: K, v: T[K]) => void;
    errors: Partial<Record<keyof T, string>>;
  }) => React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const { registrar, registrarFechar, existeOutraSuja, descartarOutras } = useDirtySections();
  const corpo = useRef<HTMLDivElement>(null);

  const [confirmado, setConfirmado] = useState<T>(values);
  const [rascunho, setRascunho] = useState<T>(values);
  const [editing, setEditing] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [perguntando, setPerguntando] = useState(false);
  const [perguntandoTroca, setPerguntandoTroca] = useState(false);

  // Sincroniza quando o pai recarrega os dados (ex.: refetch depois de um
  // import). Não sobrescreve um rascunho em andamento.
  //
  // `editing` NÃO entra nas deps de propósito: `salvar()` já seta
  // confirmado/rascunho para o valor novo e só DEPOIS chama
  // setEditing(false) — se `editing` disparasse o efeito de novo, ele
  // rodaria com a prop `values` ainda antiga (o pai não teve motivo pra
  // re-renderizar; é o retorno do onSave que carrega o valor novo) e
  // sobrescreveria o que acabou de ser salvo. O efeito só deve re-rodar
  // quando `values` (a prop) muda de verdade.
  useEffect(() => {
    if (!editing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com prop externa (values), padrão já usado em members/[id]/page.tsx
      setConfirmado(values);
      setRascunho(values);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- editing de propósito fora das deps, ver comentário acima
  }, [values]);

  const sujo = Object.keys(montarPayload(confirmado, rascunho)).length > 0;

  useEffect(() => {
    registrar(id, editing && sujo);
    return () => registrar(id, false);
  }, [id, editing, sujo, registrar]);

  const set = useCallback(<K extends keyof T>(k: K, v: T[K]) => {
    setRascunho((r) => ({ ...r, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }, []);

  const abrirAgora = () => {
    setRascunho(confirmado);
    setErrors({});
    setEditing(true);
  };

  // Uma seção em edição por vez (spec §7.2): se outra seção já está suja,
  // pergunta antes de abrir — abrir direto descartaria o rascunho alheio em
  // silêncio.
  const abrir = () => (existeOutraSuja(id) ? setPerguntandoTroca(true) : abrirAgora());

  const confirmarTroca = () => {
    descartarOutras(id);
    setPerguntandoTroca(false);
    abrirAgora();
  };

  // Foco no primeiro campo ao entrar em edição — sem isso quem navega por
  // teclado tem que percorrer o card inteiro de novo.
  useEffect(() => {
    if (!editing) return;
    corpo.current
      ?.querySelector<HTMLElement>("input, select, textarea, [contenteditable]")
      ?.focus();
  }, [editing]);

  const fechar = () => {
    setRascunho(confirmado);
    setErrors({});
    setEditing(false);
    setPerguntando(false);
  };

  // Registrado a cada render: `fechar` fecha sobre `confirmado` atual, e
  // outra seção pode chamá-lo (via descartarOutras) bem depois de montado.
  useEffect(() => {
    registrarFechar(id, fechar);
  });

  const cancelar = () => (sujo ? setPerguntando(true) : fechar());

  const salvar = async () => {
    if (!onSave) return fechar();
    const payload = montarPayload(confirmado, rascunho);
    if (Object.keys(payload).length === 0) return fechar();

    setSalvando(true);
    try {
      const devolvido = await onSave(payload);
      const novo = (devolvido ?? rascunho) as T;
      setConfirmado(novo);
      setRascunho(novo);
      setEditing(false);
      notificar.sucesso("Alterações salvas");
    } catch (err) {
      // NÃO fecha, NÃO limpa o rascunho. O toast é disparado pelo call site,
      // que sabe o que estava salvando.
      notificar.erro(
        "Não foi possível salvar",
        "Verifique suas permissões e tente de novo. O que você digitou continua aqui."
      );
      const campos = (err as { fields?: Partial<Record<keyof T, string>> })?.fields;
      if (campos) setErrors(campos);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section
      className={cn("rounded-block border border-border bg-surface-raised p-6", className)}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border pb-3">
        <h2 className="rotulo-em-card min-w-0">{label}</h2>
        {editable && (
          <div className="flex shrink-0 gap-2">
            {editing ? (
              <>
                <Button variant="ghost" size="sm" onClick={cancelar} disabled={salvando}>
                  <X size={15} aria-hidden="true" />
                  Cancelar
                </Button>
                {/* Largura preservada: o spinner ocupa o lugar do ícone, o
                    rótulo não muda. Trocar "Salvar" por "Salvando..." fazia o
                    botão pular de largura no meio do clique. */}
                <Button size="sm" onClick={salvar} disabled={salvando}>
                  {salvando ? (
                    <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Save size={15} aria-hidden="true" />
                  )}
                  Salvar
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={abrir}>
                <Pencil size={15} aria-hidden="true" />
                Editar
              </Button>
            )}
          </div>
        )}
      </div>

      <div ref={corpo}>
        {children({ editing, values: editing ? rascunho : confirmado, set, errors })}
      </div>

      <AlertDialog open={perguntando} onOpenChange={setPerguntando}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar as alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              O que você editou nesta seção será perdido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={fechar}>Descartar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={perguntandoTroca} onOpenChange={setPerguntandoTroca}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Outra seção está em edição</AlertDialogTitle>
            <AlertDialogDescription>
              Há alterações não salvas em outra seção. Editar esta seção vai
              descartá-las.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarTroca}>Descartar e editar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
