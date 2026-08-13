import { LayoutDashboard, Users, ClipboardList, UserCog, type LucideIcon } from "lucide-react";

/**
 * Extrai o array `links` que vivia dentro do Sidebar. Aqui ele é testável, e o
 * gating por papel deixa de estar embutido no JSX.
 *
 * Gating de UI apenas. O backend ignora o header x-user-role e lê o papel do
 * banco — regra técnica 1 do CLAUDE.md. Esconder um item aqui não é segurança.
 */
export type Papel = "ADMIN" | "PEOPLE" | "INTERVIEWER" | "";

export interface ItemNav {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Ausente = visível para todos. */
  papeis?: Papel[];
}

export const PESSOAS: Papel[] = ["ADMIN", "PEOPLE"];

export const NAV: { grupo: string; itens: ItemNav[] }[] = [
  {
    grupo: "GERAL",
    itens: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    grupo: "PESSOAS",
    itens: [
      { href: "/members", label: "Membros", icon: Users, papeis: PESSOAS },
      { href: "/selection", label: "Processo Seletivo", icon: ClipboardList, papeis: PESSOAS },
      { href: "/admin/users", label: "Usuários", icon: UserCog, papeis: PESSOAS },
    ],
  },
];

export function itensVisiveis(papel: Papel) {
  return NAV.map((g) => ({
    grupo: g.grupo,
    itens: g.itens.filter((i) => !i.papeis || i.papeis.includes(papel)),
  })).filter((g) => g.itens.length > 0);
}
