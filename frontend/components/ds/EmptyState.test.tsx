import { render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("mostra título e descrição", () => {
    render(<EmptyState icon={Users} title="Nada aqui" description="Ajuste os filtros." />);
    expect(screen.getByText("Nada aqui")).toBeInTheDocument();
    expect(screen.getByText("Ajuste os filtros.")).toBeInTheDocument();
  });

  // A moldura acompanha o MASCOTE, não o estado vazio. Se acompanhasse o
  // estado vazio, toda tabela sem resultado viraria assinatura da marca.
  it("sem mascote é painel comum, sem moldura", () => {
    const { container } = render(<EmptyState title="Nada aqui" />);
    expect(container.innerHTML).not.toContain("border-[3px]");
  });

  it("com mascote se envolve numa moldura", () => {
    const { container } = render(<EmptyState title="Bem-vindo" mascot />);
    expect(container.innerHTML).toContain("border-[3px]");
  });

  it("o mascote é decorativo e some para o leitor de tela", () => {
    render(<EmptyState title="Bem-vindo" mascot />);
    const img = screen.getByRole("presentation", { hidden: true });
    expect(img).toHaveAttribute("aria-hidden", "true");
  });

  it("tone=denied substitui as 3 cópias de AccessDenied", () => {
    render(<EmptyState tone="denied" title="Acesso restrito" description="Só ADMIN e PEOPLE." />);
    expect(screen.getByText("Acesso restrito")).toBeInTheDocument();
  });

  it("renderiza a ação quando passada", () => {
    render(<EmptyState title="Nada" action={<button>Importar</button>} />);
    expect(screen.getByRole("button", { name: "Importar" })).toBeInTheDocument();
  });
});
