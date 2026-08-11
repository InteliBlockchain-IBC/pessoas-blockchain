"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, FileText, ClipboardList } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { setupApiClient } from "@/services/api";
import { dashboardService, type DashboardMetrics } from "@/services/dashboard.service";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

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
    <div className="p-8 w-full max-w-7xl mx-auto flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="font-bold text-fg">Dashboard</h1>
        <p className="text-fg opacity-80">
          Visão geral da plataforma de Gestão de Pessoas.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Members card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-accent" />
              <h2 className="text-lg font-bold">Membros</h2>
            </div>
            <p className="text-2xl font-bold text-fg">
              {loading ? "-" : metrics?.totalMembers ?? 0}
            </p>
            {!loading && metrics && (
              <div className="flex flex-wrap gap-1.5">
                <Badge status="ACTIVE">Ativos: <strong>{metrics.activeMembers}</strong></Badge>
                <Badge status="INACTIVE">Inativos: <strong>{metrics.inactiveMembers}</strong></Badge>
                <Badge status="CANDIDATE">Candidatos: <strong>{metrics.candidateMembers}</strong></Badge>
                <Badge status="ALUMNI">Alumni: <strong>{metrics.alumniMembers}</strong></Badge>
              </div>
            )}
            {loading && (
              <span className="text-xs opacity-60">Carregando distribuição...</span>
            )}
          </Card>
        </motion.div>

        {/* Processes card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <ClipboardList
                size={24}
                className="text-danger"
              />
              <h2 className="text-lg font-bold">Processos Seletivos</h2>
            </div>
            <p className="text-2xl font-bold text-fg">
              {loading ? "-" : metrics?.totalProcesses ?? 0}
            </p>
            {!loading && metrics && (
              <div className="flex flex-wrap gap-1.5">
                <Badge status="ACTIVE">Ativos: <strong>{metrics.activeProcesses}</strong></Badge>
                <Badge status="CLOSED">Encerrados: <strong>{metrics.totalProcesses - metrics.activeProcesses}</strong></Badge>
              </div>
            )}
            {loading && (
              <span className="text-xs opacity-60">Carregando processos...</span>
            )}
          </Card>
        </motion.div>

        {/* PDI card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="educational" className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-fg-on-deep" />
              <h2 className="text-lg font-bold">Planos de Desenvolvimento</h2>
            </div>
            <p className="text-2xl font-bold text-fg-on-deep">
              {loading ? "-" : metrics?.totalPdis ?? 0}
            </p>
            <span className="text-xs opacity-60">Total de PDIs cadastrados</span>
          </Card>
        </motion.div>
      </div>
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
