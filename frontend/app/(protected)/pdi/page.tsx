"use client";

import { NotebookPen } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ds/PageHeader";
import { FilterBar } from "@/components/ds/FilterBar";
import { DataTable, Column } from "@/components/ds/DataTable";
import { StatusBadge } from "@/components/ds/StatusBadge";
import { EmptyState } from "@/components/ds/EmptyState";
import { membersService, Member } from "@/services/members.service";
import { pdiService, PdiEntry } from "@/services/pdi.service";
import { MEMBER_STATUS_LABEL, label } from "@/lib/labels";

interface MemberPdiRow {
  member: Member;
  hasPdi: boolean;
  lastUpdated: string | null;
}

export default function PdiListPage() {
  const router = useRouter();
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  const [rows, setRows] = useState<MemberPdiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // localStorage só existe no cliente — SSR-safe (CLAUDE.md, regra técnica 2).
    const role = localStorage.getItem("x-user-role") ?? "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanAccess(role === "ADMIN" || role === "PEOPLE");
  }, []);

  useEffect(() => {
    if (canAccess !== true) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- só desliga o loading quando o acesso já foi negado
      if (canAccess === false) setLoading(false);
      return;
    }
    Promise.all([membersService.getMembers({ limit: 200 }), pdiService.getPdis()])
      .then(([members, pdis]) => {
        const byMember = new Map<string, PdiEntry[]>();
        for (const pdi of pdis) {
          const list = byMember.get(pdi.memberId) ?? [];
          list.push(pdi);
          byMember.set(pdi.memberId, list);
        }
        setRows(
          members.map((member) => {
            const entries = byMember.get(member.id) ?? [];
            const active = entries.find((p) => p.isActive) ?? entries[0] ?? null;
            return { member, hasPdi: entries.length > 0, lastUpdated: active?.updatedAt ?? null };
          }),
        );
      })
      .catch(() => {
        // silently fail — mesmo padrão de members/page.tsx
      })
      .finally(() => setLoading(false));
  }, [canAccess]);

  const displayedRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.member.name.toLowerCase().includes(q));
  }, [rows, search]);

  const columns: Column<MemberPdiRow>[] = [
    {
      key: "name",
      header: "Nome",
      render: (r) => <span className="font-medium text-fg">{r.member.name}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.member.status} label={label(MEMBER_STATUS_LABEL, r.member.status)} />,
    },
    {
      key: "pdi",
      header: "PDI",
      render: (r) => <StatusBadge status={r.hasPdi ? "HAS_PDI" : "NO_PDI"} />,
    },
    {
      key: "lastUpdated",
      header: "Última atualização",
      render: (r) =>
        r.lastUpdated ? (
          new Date(r.lastUpdated).toLocaleDateString("pt-BR")
        ) : (
          <span className="text-fg-subtle">—</span>
        ),
    },
  ];

  if (canAccess === null) return null;
  if (!canAccess) {
    return (
      <EmptyState
        tone="denied"
        title="Acesso restrito"
        description="Esta seção é exclusiva para membros da diretoria de Pessoas (ADMIN e PEOPLE)."
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        label="PESSOAS"
        title="PDI dos Membros"
        subtitle={
          loading ? undefined : `${displayedRows.length} membro${displayedRows.length !== 1 ? "s" : ""}`
        }
        icon={NotebookPen}
      />

      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar por nome..." />

      <DataTable
        columns={columns}
        data={displayedRows}
        loading={loading}
        rowKey={(r) => r.member.id}
        onRowClick={(row) => router.push(`/members/${row.member.id}/pdi`)}
        empty={
          <EmptyState
            title="Nenhum membro encontrado"
            description="Ajuste a busca para encontrar membros."
          />
        }
      />
    </div>
  );
}
