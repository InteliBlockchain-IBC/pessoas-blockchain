"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Database, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Moldura } from "@/components/ds/Moldura";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("x-user-id")) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 relative overflow-hidden"> {/* check-visual: ok — a página de entrada está fora do AppShell */}
      <main className="z-10 max-w-3xl w-full flex flex-col items-center text-center gap-8"> {/* check-visual: ok — a página de entrada está fora do AppShell */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 items-center"
        >
          <div className="flex items-center gap-3">
            <div className="perspective-[900px]">
              <Image
                src="/logo.png"
                alt=""
                width={200}
                height={200}
                priority
                className="icone-3d h-14 w-14 md:h-16 md:w-16 drop-shadow-md"
              />
            </div>
            <h1 className="font-heading text-3xl md:text-4xl uppercase text-fg">
              <span className="font-light">inteli</span>
              <span className="font-bold">Blockchain</span>
            </h1>
          </div>
          <p className="text-lg md:text-xl text-fg max-w-xl font-light"> {/* check-visual: ok — legibilidade do parágrafo, não largura de página */}
            Plataforma centralizada para Gestão de Pessoas, Processos Seletivos e Planos de Desenvolvimento Individual.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full"
        >
          <div className="bg-surface-raised border border-border p-4 rounded-block flex flex-col items-center text-center gap-2">
            <Database size={22} className="text-fg-muted" />
            <h3 className="text-sm font-bold">Gestão Centralizada</h3>
            <p className="text-xs opacity-80">
              Membros ativos e inativos, funções e departamentos com controle de permissões.
            </p>
          </div>
          <div className="bg-surface-raised border border-border p-4 rounded-block flex flex-col items-center text-center gap-2">
            <FileSpreadsheet size={22} className="text-fg-muted" />
            <h3 className="text-sm font-bold">Processo Seletivo</h3>
            <p className="text-xs opacity-80">
              Candidaturas, avaliação de candidatos e importação de resultados de planilhas.
            </p>
          </div>
          <div className="bg-surface-raised border border-border p-4 rounded-block flex flex-col items-center text-center gap-2">
            <ShieldCheck size={22} className="text-fg-muted" />
            <h3 className="text-sm font-bold">PDI Contínuo</h3>
            <p className="text-xs opacity-80">
              Históricos de desenvolvimento versionados para todos os membros do clube.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-4"
        >
          <Moldura shadow="ciano" interactive>
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-fg focus-visible:outline-offset-[10px]"
            >
              Acesso Institucional
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </Moldura>
        </motion.div>
      </main>

      <footer className="absolute bottom-8 text-sm opacity-60 font-medium">
        © {new Date().getFullYear()} Inteli Blockchain. Acesso restrito via Google Workspace.
      </footer>
    </div>
  );
}
