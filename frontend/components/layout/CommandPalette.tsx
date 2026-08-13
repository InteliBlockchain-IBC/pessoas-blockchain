"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { itensVisiveis, PESSOAS, type Papel } from "./nav-config";
import { membersService, type Member } from "@/services/members.service";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  papel: Papel | null;
}

type Item = {
  kind: "page" | "member";
  id: string;
  label: string;
  sub?: string;
  href: string;
};

export function CommandPalette({ isOpen, onClose, papel }: CommandPaletteProps) {
  const router = useRouter();
  const isPeople = PESSOAS.includes(papel ?? "");
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  // Limpa tudo ao fechar, pra nao reabrir com residuo da busca anterior.
  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setMembers([]);
      setLoading(false);
      setActive(0);
    }
  }, [isOpen]);

  // Busca de membros: debounce de 300ms + flag de cancelamento, pra que uma
  // resposta atrasada nunca sobrescreva o resultado de uma busca mais nova.
  useEffect(() => {
    const q = query.trim();
    if (!isOpen || !isPeople || q.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let cancelled = false;

    const timer = setTimeout(() => {
      membersService
        .getMembers({ q, limit: 8 })
        .then((found) => {
          if (!cancelled) setMembers(found);
        })
        .catch(() => {
          if (!cancelled) setMembers([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, isOpen, isPeople]);

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();

    const pages: Item[] = itensVisiveis(papel ?? "")
      .flatMap((grupo) => grupo.itens)
      .filter((item) => !q || item.label.toLowerCase().includes(q))
      .map((item) => ({
        kind: "page",
        id: `page:${item.href}`,
        label: item.label,
        href: item.href,
      }));

    const memberItems: Item[] = members.map((member) => ({
      kind: "member",
      id: `member:${member.id}`,
      label: member.name,
      sub: member.email,
      href: `/members/${member.id}`,
    }));

    return [...pages, ...memberItems];
  }, [query, papel, members]);

  // Clamp em vez de efeito: a lista encolhe quando a busca muda, e o indice
  // guardado no estado pode ficar fora dela por um render.
  const activeIndex = items.length > 0 ? Math.min(active, items.length - 1) : 0;
  const pageCount = items.filter((item) => item.kind === "page").length;

  const select = useCallback(
    (item: Item | undefined) => {
      if (!item) return;
      onClose();
      router.push(item.href);
    },
    [onClose, router],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(Math.min(activeIndex + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      select(items[activeIndex]);
    }
  };

  // Mantem o item ativo visivel quando a navegacao por teclado passa do fim
  // da area rolavel.
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="top-[12%] max-w-lg translate-y-0 overflow-hidden p-0">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search size={18} className="shrink-0 text-fg-subtle" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={isPeople ? "Buscar pagina ou membro…" : "Buscar pagina…"}
            role="combobox"
            aria-expanded
            aria-controls="command-palette-list"
            aria-activedescendant={items[activeIndex]?.id}
            className="h-12 flex-1 bg-transparent text-fg outline-none placeholder:text-fg-subtle"
          />
          {loading && <Loader2 size={16} className="shrink-0 animate-spin text-fg-subtle" aria-hidden="true" />}
        </div>

        <ul ref={listRef} id="command-palette-list" role="listbox" className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-fg-muted">
              {loading ? "Buscando…" : "Nenhum resultado"}
            </li>
          )}

          {items.map((item, index) => (
            <li key={item.id}>
              {index === 0 && item.kind === "page" && (
                <p className="px-3 pt-2 pb-1 font-heading text-xs font-bold uppercase tracking-wide text-fg-subtle">
                  Páginas
                </p>
              )}
              {index === pageCount && item.kind === "member" && (
                <p className="px-3 pt-3 pb-1 font-heading text-xs font-bold uppercase tracking-wide text-fg-subtle">
                  Membros
                </p>
              )}

              <button
                type="button"
                id={item.id}
                role="option"
                aria-selected={index === activeIndex}
                data-active={index === activeIndex}
                onMouseEnter={() => setActive(index)}
                onClick={() => select(item)}
                className={`flex w-full flex-col items-start rounded-field px-3 py-2 text-left transition-colors cursor-pointer ${
                  index === activeIndex ? "bg-surface text-fg" : "text-fg-muted"
                }`}
              >
                <span className="w-full truncate font-heading text-sm font-bold">{item.label}</span>
                {item.sub && <span className="w-full truncate text-xs text-fg-subtle">{item.sub}</span>}
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
