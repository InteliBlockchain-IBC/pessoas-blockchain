"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/**
 * Conta quantas seções estão com alteração não salva, e liga o beforeunload
 * enquanto houver alguma. Antes disto, fechar a aba no meio de uma edição
 * descartava tudo em silêncio — não existia beforeunload em lugar nenhum da
 * plataforma.
 *
 * Também coordena "uma seção em edição por vez" (spec §7.2): cada SectionCard
 * registra aqui sua função de descartar-e-fechar junto com o registro de
 * "suja". Quando uma seção B quer abrir e existe outra seção A suja,
 * `descartarOutras` chama o `fechar()` registrado por A — sem SectionCard
 * precisar conhecer as outras instâncias.
 */
const Ctx = createContext<{
  sujas: number;
  registrar: (id: string, suja: boolean) => void;
  registrarFechar: (id: string, fechar: () => void) => void;
  existeOutraSuja: (id: string) => boolean;
  descartarOutras: (id: string) => void;
} | null>(null);

export function DirtyGuard({ children }: { children: React.ReactNode }) {
  const mapa = useRef(new Map<string, boolean>());
  const fechares = useRef(new Map<string, () => void>());
  const [sujas, setSujas] = useState(0);

  const registrar = useCallback((id: string, suja: boolean) => {
    if (suja) mapa.current.set(id, true);
    else mapa.current.delete(id);
    setSujas(mapa.current.size);
  }, []);

  // Guardado à parte do mapa de "suja": o fechar() de cada SectionCard muda
  // de identidade a cada render (fecha sobre confirmado/rascunho atuais), e
  // não precisa disparar re-render — só precisa estar atualizado quando
  // alguém chamar descartarOutras.
  const registrarFechar = useCallback((id: string, fechar: () => void) => {
    fechares.current.set(id, fechar);
  }, []);

  const existeOutraSuja = useCallback((id: string) => {
    for (const outroId of mapa.current.keys()) {
      if (outroId !== id) return true;
    }
    return false;
  }, []);

  const descartarOutras = useCallback((id: string) => {
    for (const [outroId, fechar] of fechares.current) {
      if (outroId !== id && mapa.current.has(outroId)) fechar();
    }
  }, []);

  useEffect(() => {
    if (sujas === 0) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [sujas]);

  const valor = useMemo(
    () => ({ sujas, registrar, registrarFechar, existeOutraSuja, descartarOutras }),
    [sujas, registrar, registrarFechar, existeOutraSuja, descartarOutras]
  );
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useDirtySections() {
  // Fora de um DirtyGuard o componente continua funcionando, só sem a
  // proteção — é o que permite testar SectionCard isolado. Sem provider,
  // "existe outra seção suja" é sempre falso: não há outras seções pra saber.
  return (
    useContext(Ctx) ?? {
      sujas: 0,
      registrar: () => {},
      registrarFechar: () => {},
      existeOutraSuja: () => false,
      descartarOutras: () => {},
    }
  );
}
