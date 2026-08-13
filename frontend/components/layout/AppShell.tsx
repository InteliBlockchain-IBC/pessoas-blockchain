"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { CommandPalette } from "./CommandPalette";
import { Toaster } from "@/components/ui/toaster";
import { DirtyGuard } from "@/components/ds/DirtyGuard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import type { Papel } from "./nav-config";

/**
 * Dono do container de toda a área autenticada.
 *
 * Antes deste componente, cada uma das 7 páginas escrevia
 * `p-8 w-full max-w-?? mx-auto` na mão, com SEIS larguras máximas diferentes — // check-visual: ok — comentário, não código
 * o conteúdo mudava de largura a cada navegação.
 *
 * TODA PÁGINA CONFIA INTEIRAMENTE NESTE CONTAINER. Nenhuma escreve p-8,
 * max-w-*, mx-auto ou min-h-screen. A largura é decisão do shell, nunca da
 * página: o próprio AppShell detecta por `usePathname()` a única tela larga
 * da plataforma — a tabela de candidatos do processo seletivo, que tem uma
 * coluna por etapa (`/selection/[id]`). Nenhuma página passa prop de largura.
 */
export function AppShell({
  colapsadaInicial = false,
  children,
}: {
  /**
   * Lida do cookie `sidebar-colapsada` por `app/(protected)/layout.tsx`
   * (Server Component) e passada aqui pronta — é o que evita o flash que
   * localStorage causaria: o cookie já viaja com a request, o Server
   * Component lê antes do primeiro HTML sair.
   */
  colapsadaInicial?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // A tabela de candidatos tem uma coluna por etapa — é a ÚNICA tela larga.
  const wide = /^\/selection\/[^/]+$/.test(pathname);

  const [menuAberto, setMenuAberto] = useState(false);
  const [colapsada, setColapsada] = useState(colapsadaInicial);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Identidade vem do AuthProvider (contexts/AuthContext.tsx), que já
  // envolve este componente — não sobra localStorage a ler. AppShell só
  // renderiza depois que o provider resolveu `/auth/me` (loading=false),
  // então `user` aqui nunca é null. `papel` alimenta o CommandPalette; o
  // Sidebar consome `useAuth()` diretamente (não recebe mais papel/email).
  const { user } = useAuth();
  const papel = (user?.role ?? "") as Papel;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <DirtyGuard>
      <div className="flex min-h-screen bg-surface"> {/* check-visual: ok — o shell é quem decide a altura */}
        <Sidebar
          isOpen={menuAberto}
          onClose={() => setMenuAberto(false)}
          colapsada={colapsada}
          onColapsarChange={setColapsada}
          onOpenSearch={() => setPaletteOpen(true)}
        />
        <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} papel={papel} />

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
