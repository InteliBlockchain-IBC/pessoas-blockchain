import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Users } from "lucide-react";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("emite o título como h1, para a hierarquia não pular nível", () => {
    render(<PageHeader label="MEMBROS" title="Membros do Clube" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Membros do Clube");
  });

  it("mostra o rótulo de calha", () => {
    render(<PageHeader label="MEMBROS" title="Membros do Clube" />);
    expect(screen.getByText("MEMBROS")).toBeInTheDocument();
  });

  it("o ícone NÃO recebe acento — o acento tem 5 papéis e este não é um", () => {
    const { container } = render(
      <PageHeader label="MEMBROS" title="Membros do Clube" icon={Users} />
    );
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("class") ?? "").not.toContain("text-accent");
  });

  it("o botão de voltar só existe quando onBack é passado, e tem nome acessível", async () => {
    const onBack = vi.fn();
    const { rerender } = render(<PageHeader label="X" title="Y" />);
    expect(screen.queryByRole("button", { name: /voltar/i })).toBeNull();

    rerender(<PageHeader label="X" title="Y" onBack={onBack} />);
    await userEvent.click(screen.getByRole("button", { name: /voltar/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
