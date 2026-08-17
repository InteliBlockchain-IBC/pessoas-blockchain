"use client";

import Image from "next/image";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";

export default function PendentePage() {
  return (
    <div className="min-h-screen flex justify-center items-center p-4"> {/* check-visual: ok — a página de aprovação pendente está fora do AppShell */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-surface-raised border border-border rounded-block w-full max-w-md text-center flex flex-col items-center gap-6 p-8" // check-visual: ok — a página de aprovação pendente está fora do AppShell
      >
        <Image
          src="/logo_texto.png"
          alt="Inteli Blockchain"
          width={4015}
          height={3006}
          priority
          className="h-20 w-auto"
        />
        <Clock size={40} className="text-accent" />
        <h1 className="text-fg font-bold">Cadastro em análise</h1>
        <p className="text-fg opacity-80">
          Recebemos seu acesso com a conta institucional. Um administrador do
          clube precisa aprovar seu cadastro antes de liberar a plataforma.
        </p>
        <p className="text-sm opacity-60">
          Você não precisa fazer nada — assim que for aprovado, é só entrar
          novamente.
        </p>
        <Button variant="ghost" onClick={() => authService.logout()}>
          Sair
        </Button>
      </motion.div>
    </div>
  );
}
