import { toast } from "@/hooks/use-toast";

/**
 * Substitui os 14 `alert()` do browser que existiam em 5 páginas. check-visual: ok — menção em doc, não uso.
 *
 * Erro NÃO some sozinho (DESIGN_SYSTEM.md §7.7): um erro que desaparece em 5
 * segundos é um erro que ninguém leu — e aqui os erros são coisas como "sem
 * permissão para salvar", que o usuário precisa poder reler.
 */
export const DURACAO = { efemero: 5000, persistente: Infinity } as const;

const base = (variant: "success" | "warning" | "error") =>
  (title: string, description?: string) =>
    toast({
      title,
      description,
      variant,
      duration: variant === "error" ? DURACAO.persistente : DURACAO.efemero,
      // Radix não lê uma prop "aria-live" custom: o nó de anúncio real é
      // interno (ToastAnnounce, role="status") e deriva aria-live de `type`
      // ("foreground" → assertive, "background" → polite). Ver
      // @radix-ui/react-toast/dist/index.js:64,145.
      type: variant === "error" ? "foreground" : "background",
    });

export const notificar = {
  sucesso: base("success"),
  aviso: base("warning"),
  erro: base("error"),
};
