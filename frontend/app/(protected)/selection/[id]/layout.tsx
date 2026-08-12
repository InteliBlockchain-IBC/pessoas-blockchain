/**
 * Segmento próprio só para acionar o `wide` do AppShell por pathname
 * (components/layout/AppShell.tsx). A tabela de candidatos tem uma coluna
 * por etapa — é a ÚNICA tela larga da plataforma. A largura continua sendo
 * decisão do shell, não desta página: este layout não estiliza nada.
 */
export default function ProcessoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div data-shell-wide>{children}</div>;
}
