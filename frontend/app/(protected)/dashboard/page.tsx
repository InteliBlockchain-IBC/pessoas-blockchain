"use client";

import { LayoutDashboard, Users, UserCheck, FileText, ClipboardList } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { setupApiClient } from "@/services/api";
import { dashboardService, type DashboardMetrics } from "@/services/dashboard.service";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ds/PageHeader";
import { KpiRow } from "@/components/ds/KpiRow";
import { KpiCard } from "@/components/ds/KpiCard";
import { SectionCard } from "@/components/ds/SectionCard";
import { StatusBadge } from "@/components/ds/StatusBadge";

function DashboardContent() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const userIdFromUrl = searchParams.get("userId");
    const roleFromUrl = searchParams.get("role");

    if (userIdFromUrl && roleFromUrl) {
      localStorage.setItem("x-user-id", userIdFromUrl);
      localStorage.setItem("x-user-role", roleFromUrl);
      setupApiClient(userIdFromUrl, roleFromUrl);
      router.replace("/dashboard");
    } else {
      setupApiClient();
    }

    const fetchMetrics = async () => {
      try {
        const data = await dashboardService.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error("Failed to fetch metrics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [searchParams, router]);

  return (
    <div className="space-y-8">
      <PageHeader
        label="VISÃO GERAL"
        title="Dashboard"
        subtitle="Gestão de pessoas do Inteli Blockchain"
        icon={LayoutDashboard}
      />

      <KpiRow>
        <KpiCard hero icon={Users} label="Membros" value={metrics?.totalMembers ?? 0} loading={loading} />
        <KpiCard icon={UserCheck} label="Ativos" value={metrics?.activeMembers ?? 0} tone="success" loading={loading} />
        <KpiCard icon={ClipboardList} label="Processos" value={metrics?.totalProcesses ?? 0} loading={loading} />
        <KpiCard icon={FileText} label="PDIs" value={metrics?.totalPdis ?? 0} loading={loading} />
      </KpiRow>

      <SectionCard label="DISTRIBUIÇÃO DE MEMBROS" values={{}}>
        {() => (
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="ACTIVE" label={`Ativos: ${metrics?.activeMembers ?? 0}`} />
            <StatusBadge status="INACTIVE" label={`Inativos: ${metrics?.inactiveMembers ?? 0}`} />
            <StatusBadge status="CANDIDATE" label={`Candidatos: ${metrics?.candidateMembers ?? 0}`} />
            <StatusBadge status="ALUMNI" label={`Alumni: ${metrics?.alumniMembers ?? 0}`} />
          </div>
        )}
      </SectionCard>

      <SectionCard label="PROCESSOS SELETIVOS" values={{}}>
        {() => (
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="ACTIVE" label={`Ativos: ${metrics?.activeProcesses ?? 0}`} />
            <StatusBadge
              status="INACTIVE"
              label={`Encerrados: ${(metrics?.totalProcesses ?? 0) - (metrics?.activeProcesses ?? 0)}`}
            />
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-fg">Carregando dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
