"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  status: string;
};

type AuthState = { user: AuthUser | null; loading: boolean };

const AuthContext = createContext<AuthState>({ user: null, loading: true });

/**
 * Dono unico da identidade do usuario no frontend.
 *
 * Antes, sete arquivos liam localStorage por conta propria, cada um num
 * useEffect([]) que rodava uma vez — a Sidebar montava antes da pagina gravar
 * o valor e ficava com o menu incompleto ate um reload. Aqui a identidade
 * vem de /auth/me uma vez so, e nenhum filho renderiza antes dela resolver.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });
  const router = useRouter();

  useEffect(() => {
    let cancelado = false;

    api
      .get("/auth/me")
      .then((res) => {
        if (cancelado) return;
        // ResponseInterceptor do backend envelopa tudo (CLAUDE.md, regra 3).
        const user = res.data?.data as AuthUser;

        if (user.status !== "APPROVED") {
          router.replace("/pendente");
          return;
        }
        setState({ user, loading: false });
      })
      .catch(() => {
        // 401 e 403 ja sao tratados pelo interceptor de api.ts, que redireciona.
        if (!cancelado) setState({ user: null, loading: true });
      });

    return () => {
      cancelado = true;
    };
  }, [router]);

  // CRITICO: nao renderizar `children` enquanto `loading`. As paginas derivam
  // `canAccess` de `user.role` no render; com `user` ainda null elas
  // calculariam `false` e piscariam "Acesso negado" antes de resolver — o
  // mesmo defeito do item 3, so que com outra cara.
  if (state.loading) {
    // O AuthProvider envolve o layout inteiro (Sidebar inclusive), entao este
    // esqueleto ocupa a tela toda.
    return (
      <div className="min-h-screen bg-surface flex">
        <div className="hidden md:block w-64 border-r border-border bg-surface-raised" />
        <div className="flex-1 p-8">
          <div className="h-8 w-48 rounded-field bg-surface-raised animate-pulse" />
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
