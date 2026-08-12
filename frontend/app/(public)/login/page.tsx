"use client";

import Image from "next/image";
import { LogIn } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { Moldura } from "@/components/ds/Moldura";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-screen items-center justify-center p-4"> {/* check-visual: ok — o login está fora do AppShell */}
      <Moldura shadow="magenta" className="w-full max-w-md"> {/* check-visual: ok — o login está fora do AppShell */}
        <div className="flex flex-col items-center gap-6 p-8 text-center">
          <Image src="/logo_texto.png" alt="Inteli Blockchain" width={4015} height={3006} priority className="h-20 w-auto" />
          <h1 className="font-heading text-xl font-bold text-fg">Bem-vindo(a)</h1>
          <p className="text-sm text-fg-muted">
            Para acessar a plataforma, faça login com sua conta institucional{" "}
            <strong className="text-fg">@sou.inteli.edu.br</strong>.
          </p>
          <Button onClick={handleLogin} size="lg" className="w-full">
            <LogIn size={20} aria-hidden="true" />
            Entrar com o Google
          </Button>
          <p className="text-xs text-fg-subtle">
            Apenas contas autorizadas do Inteli Blockchain terão acesso aos módulos do sistema.
          </p>
        </div>
      </Moldura>
    </div>
  );
}
