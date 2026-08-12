"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  usersService,
  PlatformUser,
  UserRole,
  UserStatus,
} from "@/services/users.service";
import { UserCog } from "lucide-react";
import { PageHeader } from "@/components/ds/PageHeader";
import { FilterBar, FiltroSelect } from "@/components/ds/FilterBar";
import { DataTable, Column } from "@/components/ds/DataTable";
import { StatusBadge } from "@/components/ds/StatusBadge";
import { EmptyState } from "@/components/ds/EmptyState";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notificar } from "@/components/ds/toast-helpers";

const ROLE_FILTER_OPTIONS = [
  { value: "todos", label: "Todos os papéis" },
  { value: "ADMIN", label: "Admin" },
  { value: "PEOPLE", label: "People" },
  { value: "INTERVIEWER", label: "Entrevistador" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "todos", label: "Todos os status" },
  { value: "PENDING", label: "Pendente" },
  { value: "APPROVED", label: "Aprovado" },
  { value: "REJECTED", label: "Rejeitado" },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  PEOPLE: "People",
  INTERVIEWER: "Entrevistador",
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
      notificar.erro("Erro ao atualizar status do usuário.");
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      const updated = await usersService.updateRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch {
      notificar.erro("Erro ao alterar papel do usuário.");
    }
  };

  const filtros: FiltroSelect[] = [
    {
      key: "role",
      label: "Papel",
      value: roleFilter || "todos",
      onChange: (v) => setRoleFilter(v === "todos" ? "" : v),
      options: ROLE_FILTER_OPTIONS,
    },
    {
      key: "status",
      label: "Status",
      value: statusFilter || "todos",
      onChange: (v) => setStatusFilter(v === "todos" ? "" : v),
      options: STATUS_FILTER_OPTIONS,
    },
  ];

  const columns: Column<PlatformUser>[] = [
    {
      key: "user",
      header: "Usuário",
      render: (user) => (
        <>
          <p className="font-semibold text-fg">
            {user.name ?? <span className="font-normal text-fg-subtle">Sem nome</span>}
          </p>
          <p className="text-xs text-fg-muted">{user.email}</p>
        </>
      ),
    },
    {
      key: "role",
      header: "Papel",
      render: (user) =>
        // Papel não é badge — é identidade, não estado (mesma lógica de
        // Department, DESIGN_SYSTEM.md §7.4).
        isAdmin ? (
          <Select value={user.role} onValueChange={(v) => handleRoleChange(user.id, v as UserRole)}>
            <SelectTrigger size="sm" className="w-40" aria-label={`Papel de ${user.email}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="PEOPLE">People</SelectItem>
              <SelectItem value="INTERVIEWER">Entrevistador</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span className="text-xs font-bold text-fg-muted">{ROLE_LABELS[user.role] ?? user.role}</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: "actions",
      header: "Ações",
      render: (user) => (
        <div className="flex gap-2">
          {user.status !== "APPROVED" && (
            <Button size="sm" variant="outline" onClick={() => handleApprove(user.id, "APPROVED")}>
              Aprovar
            </Button>
          )}
          {user.status !== "REJECTED" && (
            <Button size="sm" variant="destructive" onClick={() => handleApprove(user.id, "REJECTED")}>
              Rejeitar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        label="ADMINISTRAÇÃO"
        title="Usuários da Plataforma"
        subtitle={loading ? undefined : `${users.length} usuário${users.length !== 1 ? "s" : ""}`}
        icon={UserCog}
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome ou email..."
        filters={filtros}
        onClear={() => {
          setSearch("");
          setRoleFilter("");
          setStatusFilter("");
        }}
      />

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        rowKey={(u) => u.id}
        empty={
          <EmptyState
            title="Nenhum usuário encontrado"
            description="Ajuste a busca ou os filtros para encontrar usuários."
          />
        }
      />
    </div>
  );
}
