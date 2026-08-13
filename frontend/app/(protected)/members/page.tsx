"use client";

import { Download, Upload, Users, UserCheck, UserPlus, GraduationCap } from "lucide-react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ds/PageHeader";
import { KpiRow } from "@/components/ds/KpiRow";
import { KpiCard } from "@/components/ds/KpiCard";
import { FilterBar, FiltroSelect } from "@/components/ds/FilterBar";
import { DataTable, Column } from "@/components/ds/DataTable";
import { StatusBadge } from "@/components/ds/StatusBadge";
import { EmptyState } from "@/components/ds/EmptyState";
import { Button } from "@/components/ui/button";
import { membersService, Member, MemberFilters } from "@/services/members.service";
import { selectionService, SelectionProcess, Application } from "@/services/selection.service";
import { MEMBER_STATUS_LABEL, DEPARTMENT_LABEL, POSITION_LABEL, label } from "@/lib/labels";
import { notificar } from "@/components/ds/toast-helpers";
import { useAuth } from "@/contexts/AuthContext";

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos os status" },
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
  { value: "CANDIDATE", label: "Candidato" },
  { value: "ALUMNI", label: "Alumni" },
];

const DEPARTMENT_OPTIONS = [
  { value: "todos", label: "Todos os departamentos" },
  { value: "PEOPLE", label: "People" },
  { value: "MARKETING", label: "Marketing" },
  { value: "PROJECTS", label: "Projetos" },
  { value: "EDUCATIONAL", label: "Educacional" },
];

const POSITION_OPTIONS = [
  { value: "todos", label: "Todos os cargos" },
  { value: "MEMBER", label: "Membro" },
  { value: "HEAD", label: "Head" },
  { value: "DIRECTOR", label: "Diretor(a)" },
  { value: "PRESIDENT", label: "Presidente" },
];

export default function MembersPage() {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const router = useRouter();

  const { user } = useAuth();
  const canAccess = user?.role === "ADMIN" || user?.role === "PEOPLE";

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [processFilter, setProcessFilter] = useState("");
  const [interestsFilter, setInterestsFilter] = useState("");

  // Selection process options
  const [processes, setProcesses] = useState<SelectionProcess[]>([]);
  const [processApplicants, setProcessApplicants] = useState<Set<string>>(new Set());

  // Debounce timer
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load processes for filter
  useEffect(() => {
    selectionService.getProcesses().then(setProcesses).catch(() => {});
  }, []);

  // When process filter changes, load applicants
  useEffect(() => {
    if (!processFilter) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpa o estado quando o filtro esvazia, parte do mesmo efeito que busca os dados abaixo
      setProcessApplicants(new Set());
      return;
    }
    selectionService.getApplications(processFilter).then((apps: Application[]) => {
      setProcessApplicants(new Set(apps.map((a) => a.memberId)));
    }).catch(() => setProcessApplicants(new Set()));
  }, [processFilter]);

  // Fetch members from server whenever server-side filters change
  const fetchMembers = useCallback(async (filters: MemberFilters) => {
    setLoading(true);
    try {
      const data = await membersService.getMembers({ ...filters, limit: 200 });
      setAllMembers(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- dispara a busca inicial assim que canAccess resolve
    if (canAccess) fetchMembers({ limit: 200 });
    else setLoading(false);
  }, [fetchMembers, canAccess]);

  // Re-fetch when server-side filters change (with debounce for search)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchMembers({
        q: search || undefined,
        status: statusFilter || undefined,
        department: deptFilter || undefined,
        position: positionFilter || undefined,
        interests: interestsFilter || undefined,
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, statusFilter, deptFilter, positionFilter, interestsFilter, fetchMembers]);

  // Client-side filter for process (cross-reference) — puramente derivado, sem
  // efeito colateral, então useMemo em vez de useState+useEffect.
  const displayedMembers = useMemo(() => {
    if (!processFilter || processApplicants.size === 0) return allMembers;
    return allMembers.filter((m) => processApplicants.has(m.id));
  }, [allMembers, processFilter, processApplicants]);

  const contagem = (s: string) => allMembers.filter((m) => m.status === s).length;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setDeptFilter("");
    setPositionFilter("");
    setProcessFilter("");
    setInterestsFilter("");
  };

  const handleExportCSV = async () => {
    try {
      await membersService.exportCSV();
    } catch {
      notificar.erro("Erro ao exportar CSV.");
    }
  };

  const handleImportClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xlsx, .csv";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setImporting(true);
        try {
          const data = await membersService.importMembers(file);
          setAllMembers(data);
          notificar.sucesso("Membros importados com sucesso!");
        } catch {
          notificar.erro("Erro ao importar membros.");
        } finally {
          setImporting(false);
        }
      }
    };
    fileInput.click();
  };

  const filtros: FiltroSelect[] = [
    {
      key: "status",
      label: "Status",
      value: statusFilter || "todos",
      onChange: (v) => setStatusFilter(v === "todos" ? "" : v),
      options: STATUS_OPTIONS,
    },
    {
      key: "department",
      label: "Departamento",
      value: deptFilter || "todos",
      onChange: (v) => setDeptFilter(v === "todos" ? "" : v),
      options: DEPARTMENT_OPTIONS,
    },
    {
      key: "position",
      label: "Cargo",
      value: positionFilter || "todos",
      onChange: (v) => setPositionFilter(v === "todos" ? "" : v),
      options: POSITION_OPTIONS,
    },
    {
      key: "process",
      label: "Processo seletivo",
      value: processFilter || "todos",
      onChange: (v) => setProcessFilter(v === "todos" ? "" : v),
      options: [
        { value: "todos", label: "Todos os processos" },
        ...processes.map((p) => ({ value: p.id, label: `${p.name} (${p.year})` })),
      ],
    },
  ];

  const columns: Column<Member>[] = [
    {
      key: "name",
      header: "Nome",
      render: (m) => <span className="font-medium text-fg">{m.name}</span>,
    },
    { key: "email", header: "Email" },
    {
      key: "department",
      header: "Departamento",
      render: (m) =>
        m.department ? (
          label(DEPARTMENT_LABEL, m.department)
        ) : (
          <span className="opacity-40">—</span>
        ),
    },
    {
      key: "position",
      header: "Cargo",
      render: (m) =>
        m.position ? (
          label(POSITION_LABEL, m.position)
        ) : (
          <span className="opacity-40">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (m) => <StatusBadge status={m.status} label={label(MEMBER_STATUS_LABEL, m.status)} />,
    },
    {
      key: "interests",
      header: "Interesses",
      render: (m) =>
        m.interests && m.interests.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {m.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="px-2 py-0.5 rounded-full text-xs bg-surface-raised text-fg-muted whitespace-nowrap"
              >
                {interest}
              </span>
            ))}
            {m.interests.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-surface-raised text-fg-muted opacity-50 whitespace-nowrap">
                +{m.interests.length - 3}
              </span>
            )}
          </div>
        ) : (
          <span className="opacity-30 text-xs">—</span>
        ),
    },
  ];

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
        title="Membros do Clube"
        subtitle={
          loading
            ? undefined
            : `${displayedMembers.length} membro${displayedMembers.length !== 1 ? "s" : ""}`
        }
        icon={Users}
        actions={
          <>
            <Button variant="outline" onClick={handleImportClick} disabled={importing}>
              <Upload size={18} />
              {importing ? "Importando..." : "Importar"}
            </Button>
            <Button onClick={handleExportCSV}>
              <Download size={18} />
              Exportar CSV
            </Button>
          </>
        }
      />

      <KpiRow>
        <KpiCard hero icon={Users} label="Total" value={allMembers.length} loading={loading} />
        <KpiCard icon={UserCheck} label="Ativos" value={contagem("ACTIVE")} tone="success" loading={loading} />
        <KpiCard icon={UserPlus} label="Candidatos" value={contagem("CANDIDATE")} loading={loading} />
        <KpiCard icon={GraduationCap} label="Alumni" value={contagem("ALUMNI")} loading={loading} />
      </KpiRow>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome ou email..."
        filters={filtros}
        onClear={clearFilters}
        extra={
          <div className="relative">
            <input
              type="text"
              value={interestsFilter}
              onChange={(e) => setInterestsFilter(e.target.value)}
              placeholder="Filtrar por interesse..."
              className="min-w-45 rounded-field border border-border-interactive bg-surface-sunken px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
            />
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={displayedMembers}
        loading={loading}
        rowKey={(m) => m.id}
        onRowClick={(member) => router.push(`/members/${member.id}`)}
        empty={
          <EmptyState
            title="Nenhum membro encontrado"
            description="Ajuste a busca ou os filtros para encontrar membros."
          />
        }
      />
    </div>
  );
}
