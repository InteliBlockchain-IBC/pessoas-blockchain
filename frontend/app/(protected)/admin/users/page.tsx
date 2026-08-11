"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  usersService,
  PlatformUser,
  UserRole,
  UserStatus,
} from "@/services/users.service";
import { motion } from "framer-motion";
import { Search, X, UserCog, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Todos os papéis" },
  { value: "ADMIN", label: "Admin" },
  { value: "PEOPLE", label: "People" },
  { value: "INTERVIEWER", label: "Entrevistador" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Todos os status" },
  { value: "PENDING", label: "Pendente" },
  { value: "APPROVED", label: "Aprovado" },
  { value: "REJECTED", label: "Rejeitado" },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  PEOPLE: "People",
  INTERVIEWER: "Entrevistador",
};

const STATUS_LABEL: Record<string, string> = {
  APPROVED: "Aprovado",
  PENDING: "Pendente",
  REJECTED: "Rejeitado",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // localStorage só existe no cliente — SSR-safe (CLAUDE.md, regra técnica 2).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAdmin(localStorage.getItem("x-user-role") === "ADMIN");
  }, []);

  const fetchUsers = useCallback(
    async (filters: { q?: string; role?: string; status?: string }) => {
      setLoading(true);
      try {
        const data = await usersService.getUsers({ ...filters, limit: 500 });
        setUsers(data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial ao montar
    fetchUsers({});
  }, [fetchUsers]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers({
        q: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, roleFilter, statusFilter, fetchUsers]);

  const handleApprove = async (userId: string, status: UserStatus) => {
    try {
      const updated = await usersService.approveUser(userId, status);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch {
      alert("Erro ao atualizar status do usuário.");
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      const updated = await usersService.updateRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch {
      alert("Erro ao alterar papel do usuário.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 w-full max-w-6xl mx-auto flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <UserCog size={32} className="text-accent" />
        <div>
          <h1 className="font-bold text-fg">Usuários da Plataforma</h1>
          {!loading && (
            <p className="text-sm opacity-60 mt-0.5">
              {users.length} usuário{users.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-50">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full bg-surface-sunken border border-border-interactive text-fg text-sm rounded-field pl-9 pr-4 py-2 focus:outline-none focus:border-accent placeholder:text-fg-subtle"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {[
          { value: roleFilter, onChange: setRoleFilter, options: ROLE_OPTIONS },
          { value: statusFilter, onChange: setStatusFilter, options: STATUS_OPTIONS },
        ].map((sel, i) => (
          <div key={i} className="relative">
            <select
              value={sel.value}
              onChange={(e) => sel.onChange(e.target.value)}
              className="appearance-none bg-surface-sunken border border-border-interactive text-fg text-sm rounded-field px-3 py-2 pr-8 focus:outline-none focus:border-accent cursor-pointer min-w-40"
            >
              {sel.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none"
            />
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-surface-raised border border-border p-6 rounded-block w-full min-h-75 flex items-center justify-center">
          <p className="opacity-60">Carregando usuários...</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-block border border-border">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-surface-raised border-b border-border">
                <th className="p-3 font-bold text-fg">Usuário</th>
                <th className="p-3 font-bold text-fg">Papel</th>
                <th className="p-3 font-bold text-fg">Status</th>
                <th className="p-3 font-bold text-fg">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-surface">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-fg-muted"
                  >
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface-raised transition-colors"
                  >
                    <td className="p-3">
                      <p className="font-semibold text-fg">
                        {user.name ?? (
                          <span className="opacity-40 font-normal">Sem nome</span>
                        )}
                      </p>
                      <p className="text-xs opacity-50">{user.email}</p>
                    </td>

                    <td className="p-3">
                      {/* Papel não é badge — é identidade, não estado (mesma
                          lógica de Department, DESIGN_SYSTEM.md §7.4). */}
                      {isAdmin ? (
                        <div className="relative inline-block">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value as UserRole)
                            }
                            className="appearance-none bg-surface-sunken border border-border-interactive text-fg text-xs font-bold px-2.5 py-1 pr-6 rounded-field cursor-pointer focus:outline-none focus:border-accent"
                          >
                            <option value="ADMIN">Admin</option>
                            <option value="PEOPLE">People</option>
                            <option value="INTERVIEWER">Entrevistador</option>
                          </select>
                          <ChevronDown
                            size={11}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                          />
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-fg-muted">
                          {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <Badge status={user.status} label={STATUS_LABEL[user.status] ?? user.status} />
                    </td>

                    <td className="p-3">
                      <div className="flex gap-2">
                        {user.status !== "APPROVED" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleApprove(user.id, "APPROVED")}
                          >
                            Aprovar
                          </Button>
                        )}
                        {user.status !== "REJECTED" && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleApprove(user.id, "REJECTED")}
                          >
                            Rejeitar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
