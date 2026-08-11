"use client";

import { useId, useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FiltroSelect {
  key: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

/**
 * Busca + filtros. Antes disto, members (linhas 330–458) e admin/users
 * (430–475) implementavam a mesma coisa separadamente, com estruturas
 * parecidas o bastante para confundir e diferentes o bastante para divergir.
 *
 * O DEBOUNCE FICA NA PÁGINA. Este componente é apresentação; quem sabe quando
 * refazer a busca é quem tem o useCallback de fetch.
 */
export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Buscar…",
  filters = [],
  onClear,
  extra,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  filters?: FiltroSelect[];
  onClear?: () => void;
  extra?: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const buscaId = useId();
  const ativos = [search, ...filters.map((f) => f.value)].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor={buscaId} className="sr-only">
            {searchPlaceholder}
          </label>
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle"
          />
          <input
            id={buscaId}
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-field border border-border-interactive bg-surface-sunken pl-9 pr-9 text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-fg-subtle hover:text-fg"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        {filters.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            className={cn("shrink-0", ativos === 0 && "border-border text-fg-muted")}
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            Filtros
            {ativos > 0 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-pill bg-accent px-1 text-xs font-bold text-accent-fg">
                {ativos}
              </span>
            )}
          </Button>
        )}

        {ativos > 0 && onClear && (
          <Button variant="ghost" onClick={onClear} className="shrink-0">
            <X size={15} aria-hidden="true" />
            Limpar tudo
          </Button>
        )}
      </div>

      <AnimatePresence>
        {aberto && filters.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 pt-1">
              {filters.map((f) => (
                <Select key={f.key} value={f.value} onValueChange={f.onChange}>
                  <SelectTrigger className="h-10 min-w-44 rounded-field" aria-label={f.label}>
                    <SelectValue placeholder={f.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
              {extra}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
