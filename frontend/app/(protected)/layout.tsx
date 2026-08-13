import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/contexts/AuthContext";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server Component: lê o cookie da request antes do primeiro HTML sair —
  // é isso que evita o flash que localStorage teria (AppShell.tsx).
  const cookieStore = await cookies();
  const colapsadaInicial = cookieStore.get("sidebar-colapsada")?.value === "true";

  return (
    <AuthProvider>
      <AppShell colapsadaInicial={colapsadaInicial}>{children}</AppShell>
    </AuthProvider>
  );
}
