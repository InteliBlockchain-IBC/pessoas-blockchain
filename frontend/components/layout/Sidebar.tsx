"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeftOpen, UserRound, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { itensVisiveis, type Papel } from "./nav-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROTULO_PAPEL: Record<string, string> = {
  ADMIN: "Administrador",
  PEOPLE: "Pessoas",
  INTERVIEWER: "Entrevistador",
};

interface SidebarProps {
  /** Vem do AppShell, lido do localStorage uma única vez (spec §13). */
  papel: Papel | null;
  /** Idem — hoje sempre null, ninguém grava "x-user-email" ainda. */
  email: string | null;
  isOpen: boolean;
  onClose: () => void;
  colapsada: boolean;
  onColapsarChange: (colapsada: boolean) => void;
}

export function Sidebar({ papel, email, isOpen, onClose, colapsada, onColapsarChange }: SidebarProps) {
  const pathname = usePathname();
  const grupos = itensVisiveis(papel ?? "");
  const rotuloUsuario = email ?? (papel ? (ROTULO_PAPEL[papel] ?? papel) : "Usuário");

  function alternarColapsada() {
    const novoValor = !colapsada;
    onColapsarChange(novoValor);
    document.cookie = `sidebar-colapsada=${novoValor}; path=/; max-age=31536000; SameSite=Lax`;
  }

  function sair() {
    localStorage.removeItem("x-user-id");
    localStorage.removeItem("x-user-role");
    localStorage.removeItem("x-user-email");
    window.location.href = "/";
  }

  // O drawer mobile é um overlay com fechar próprio, não uma barra
  // persistente — sempre abre cheio/rotulado, independente do cookie de
  // colapso do desktop (o botão de expandir só existe em md:, spec exige
  // "colapsável no desktop"). Por isso o conteúdo é uma função: a barra
  // desktop respeita `colapsada`, o drawer sempre passa `forcarExpandido`.
  function renderConteudo(forcarExpandido: boolean) {
    const efetivamenteColapsada = colapsada && !forcarExpandido;

    return (
      <div
        className={cn(
          "flex h-full flex-col border-r border-border bg-surface-raised transition-[width] duration-200",
          efetivamenteColapsada ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center justify-between gap-1 border-b border-border p-4">
          <Link href="/dashboard" onClick={onClose} className="flex min-w-0 items-center gap-3">
            {efetivamenteColapsada ? (
              <Image src="/logo.png" alt="Inteli Blockchain" width={914} height={1062} priority className="h-9 w-auto shrink-0" />
            ) : (
              <Image src="/logo_texto.png" alt="Inteli Blockchain" width={3651} height={1194} priority className="h-8 w-auto" />
            )}
          </Link>

          {/* Fechar — só no drawer mobile */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="shrink-0 rounded-field p-1.5 text-fg-muted transition-colors hover:bg-surface hover:text-fg md:hidden"
          >
            <X size={20} aria-hidden="true" />
          </button>

          {/* Colapsar — só no desktop */}
          <button
            type="button"
            onClick={alternarColapsada}
            aria-label={colapsada ? "Expandir menu" : "Recolher menu"}
            className="hidden shrink-0 rounded-field p-1.5 text-fg-muted transition-colors hover:bg-surface hover:text-fg md:flex"
          >
            {colapsada ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
          </button>
        </div>

        <nav aria-label="Navegação principal" className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
          {grupos.map((grupo) => (
            <div key={grupo.grupo} className="flex flex-col gap-1">
              {!efetivamenteColapsada && (
                <p className="px-4 pb-1 font-heading text-xs font-bold uppercase tracking-wide text-fg-muted">
                  {grupo.grupo}
                </p>
              )}
              {grupo.itens.map((item) => {
                const ativo = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    aria-current={ativo ? "page" : undefined}
                    aria-label={efetivamenteColapsada ? item.label : undefined}
                    title={efetivamenteColapsada ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 border-l-2 py-2.5 pl-4 pr-3 font-heading text-sm font-bold transition-colors",
                      ativo
                        ? "border-l-accent text-fg"
                        : "border-l-transparent text-fg-muted hover:border-l-border-interactive hover:text-fg"
                    )}
                  >
                    <Icon size={20} aria-hidden="true" className="shrink-0" />
                    {!efetivamenteColapsada && item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={efetivamenteColapsada ? rotuloUsuario : undefined}
                title={efetivamenteColapsada ? rotuloUsuario : undefined}
                className="flex w-full items-center gap-3 rounded-field px-2 py-2 text-left font-heading text-sm font-bold text-fg-muted transition-colors hover:bg-surface hover:text-fg"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface">
                  <UserRound size={16} aria-hidden="true" />
                </span>
                {!efetivamenteColapsada && <span className="min-w-0 flex-1 truncate">{rotuloUsuario}</span>}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56">
              <DropdownMenuItem variant="destructive" onSelect={sair}>
                <LogOut size={16} aria-hidden="true" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop — always visible, respeita o colapso */}
      <div className="hidden h-screen shrink-0 md:sticky md:top-0 md:flex">{renderConteudo(false)}</div>

      {/* Mobile — overlay drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ backgroundColor: "color-mix(in srgb, var(--surface) 70%, transparent)" }}
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 h-full md:hidden"
            >
              {/* Sempre expandido — o cookie de colapso é preferência de desktop */}
              {renderConteudo(true)}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
