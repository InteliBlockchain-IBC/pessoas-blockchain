"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Database, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        const status = res.data?.data?.status;
        router.replace(status === "APPROVED" ? "/dashboard" : "/pendente");
      })
      .catch(() => {
        // Sem sessao: e o caso normal da landing, fica na propria pagina.
      });
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 relative overflow-hidden"> {/* check-visual: ok — a página de entrada está fora do AppShell */}
      <main className="z-10 max-w-4xl w-full flex flex-col items-center text-center gap-8"> {/* check-visual: ok — a página de entrada está fora do AppShell */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 items-center"
        >
          <Image
            src="/logo_texto.png"
            alt="Inteli Blockchain"
            width={4000}
            height={2000}
            priority
            className="h-56 md:h-80 w-auto mb-2 drop-shadow-md "
          />
          <p className="text-xl md:text-2xl text-fg max-w-2xl font-light"> {/* check-visual: ok — legibilidade do parágrafo, não largura de página */}
            Plataforma centralizada para Gestão de Pessoas, Processos Seletivos e Planos de Desenvolvimento Individual.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8"
        >
          <div className="bg-surface-raised border border-border p-6 rounded-none flex flex-col items-center text-center gap-3">
            <Database size={32} className="text-fg-muted" />
            <h3 className="text-xl font-bold">Gestão Centralizada</h3>
            <p className="text-sm opacity-80">
              Gerencie membros ativos e inativos, funções e departamentos com controle de permissões.
            </p>
          </div>
          <div className="bg-surface-raised border border-border p-6 rounded-none flex flex-col items-center text-center gap-3">
            <FileSpreadsheet size={32} className="text-fg-muted" />
            <h3 className="text-xl font-bold">Processo Seletivo</h3>
            <p className="text-sm opacity-80">
              Acompanhe candidaturas, avalie candidatos e importe resultados de planilhas.
            </p>
          </div>
          <div className="bg-surface-raised border border-border p-6 rounded-none flex flex-col items-center text-center gap-3">
            <ShieldCheck size={32} className="text-fg-muted" />
            <h3 className="text-xl font-bold">PDI Contínuo</h3>
            <p className="text-sm opacity-80">
              Crie históricos de desenvolvimento versionados para todos os membros do clube.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 items-center"
        >
          <Button asChild size="lg">
            <Link href="/login">
              Acesso Institucional
              <ArrowRight size={20} />
            </Link>
          </Button>
        </motion.div>
      </main>

      <footer className="absolute bottom-8 text-sm opacity-60 font-medium">
        © {new Date().getFullYear()} Inteli Blockchain. Acesso restrito via Google Workspace.
      </footer>
    </div>
  );
}
