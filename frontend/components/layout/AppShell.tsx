"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { DirtyGuard } from "@/components/ds/DirtyGuard";
import { cn } from "@/lib/utils";
import type { Papel } from "./nav-config";

/**
 * Dono do container de toda a área autenticada.
 *
 * Antes deste componente, cada uma das 7 páginas escrevia
 * `p-8 w-full max-w-?? mx-auto` na mão, com SEIS larguras máximas diferentes — // check-visual: ok — comentário, não código
 * o conteúdo mudava de largura a cada navegação.
 *
 * TODA PÁGINA CONFIA INTEIRAMENTE NESTE CONTAINER. Nenhuma escreve p-8,
 * max-w-*, mx-auto ou min-h-screen. Se uma página precisar de outra largura, a
 * resposta é a prop `wide` aqui, nunca um wrapper por cima.
 */
export function AppShell({
  wide = false,
  colapsadaInicial = false,
  children,
}: {
  wide?: boolean;
  /**
   * Lida do cookie `sidebar-colapsada` por `app/(protected)/layout.tsx`
   * (Server Component) e passada aqui pronta — é o que evita o flash que
   * localStorage causaria: o cookie já viaja com a request, o Server
   * Component lê antes do primeiro HTML sair.
   */
  colapsadaInicial?: boolean;
  children: React.ReactNode;
}) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [colapsada, setColapsada] = useState(colapsadaInicial);
  // SSR-safe: null enquanto o localStorage não foi lido (CLAUDE.md, regra 2).
  const [papel, setPapel] = useState<Papel | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPapel((localStorage.getItem("x-user-role") ?? "") as Papel);
    // Ninguém grava "x-user-email" ainda hoje — fica null e o Sidebar cai no
    // rótulo do papel. Lido aqui (não no Sidebar) para manter um único dono
    // de leitura de localStorage, mesmo risco do papel (spec §13).
    setEmail(localStorage.getItem("x-user-email"));
  }, []);

  return (
    <DirtyGuard>
      <div className="flex min-h-screen bg-surface"> {/* check-visual: ok — o shell é quem decide a altura */}
        <Sidebar
          papel={papel}
          email={email}
          isOpen={menuAberto}
          onClose={() => setMenuAberto(false)}
          colapsada={colapsada}
          onColapsarChange={setColapsada}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface-raised px-4 md:hidden">
            <button
              type="button"
              onClick={() => setMenuAberto(true)}
              aria-label="Abrir menu"
              className="flex h-11 w-11 items-center justify-center rounded-field text-fg-muted transition-colors hover:bg-surface hover:text-fg"
            >
              <Menu size={22} aria-hidden="true" />
            </button>
            <Image src="/logo.png" alt="Inteli Blockchain" width={914} height={1062} priority className="h-7 w-auto" />
          </header>

          <main className="flex-1">
            <div className={cn("mx-auto px-6 pb-10 pt-6", wide ? "max-w-none" : "max-w-6xl")}> {/* check-visual: ok — o shell é quem decide a largura */}
              {children}
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </DirtyGuard>
  );
}
