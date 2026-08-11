"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/**
 * Conta quantas seções estão com alteração não salva, e liga o beforeunload
 * enquanto houver alguma. Antes disto, fechar a aba no meio de uma edição
 * descartava tudo em silêncio — não existia beforeunload em lugar nenhum da
 * plataforma.
 */
const Ctx = createContext<{
  sujas: number;
  registrar: (id: string, suja: boolean) => void;
} | null>(null);

export function DirtyGuard({ children }: { children: React.ReactNode }) {
  const mapa = useRef(new Map<string, boolean>());
  const [sujas, setSujas] = useState(0);

  const registrar = useCallback((id: string, suja: boolean) => {
    if (suja) mapa.current.set(id, true);
    else mapa.current.delete(id);
    setSujas(mapa.current.size);
  }, []);

  useEffect(() => {
    if (sujas === 0) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [sujas]);

  const valor = useMemo(() => ({ sujas, registrar }), [sujas, registrar]);
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useDirtySections() {
  // Fora de um DirtyGuard o componente continua funcionando, só sem a
  // proteção — é o que permite testar SectionCard isolado.
  return useContext(Ctx) ?? { sujas: 0, registrar: () => {} };
}
