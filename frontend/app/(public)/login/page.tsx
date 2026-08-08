"use client";

import Image from "next/image";
import { LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = () => {
    window.location.href = authService.getGoogleAuthUrl();
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-surface-raised border border-border rounded-block w-full max-w-md text-center flex flex-col items-center gap-6 p-8"
      >
        <Image
          src="/logo_texto.png"
          alt="Inteli Blockchain"
          width={4015}
          height={3006}
          priority
          className="h-20 w-auto"
        />
        <h1 className="text-fg font-bold">Bem-vindo(a)</h1>
        <p className="text-fg opacity-80 mb-4">
          Para acessar a plataforma, faça login com sua conta institucional <strong>@sou.inteli.edu.br</strong>.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogin}
          className="font-heading font-bold rounded-block transition-all bg-accent text-accent-fg hover:bg-accent-hover w-full flex items-center justify-center gap-3 px-6 py-3"
        >
          <LogIn size={20} />
          Entrar com o Google
        </motion.button>

        <div className="text-xs opacity-50 mt-4">
          Apenas contas autorizadas do Inteli Blockchain terão acesso aos módulos do sistema.
        </div>
      </motion.div>
    </div>
  );
}
