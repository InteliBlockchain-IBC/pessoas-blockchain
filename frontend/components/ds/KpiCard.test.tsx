import { render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { KpiRow } from "./KpiRow";

describe("KpiCard", () => {
  it("mostra rótulo e valor", () => {
    render(<KpiCard icon={Users} label="Total" value={42} />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("hero usa acento sólido com texto escuro", () => {
    const { container } = render(<KpiCard hero icon={Users} label="Total" value={42} />);
    const cls = container.firstElementChild!.className;
    expect(cls).toContain("bg-accent");
    expect(cls).toContain("text-accent-fg");
  });

  it("números usam tabular-nums para não dançar quando mudam", () => {
    render(<KpiCard icon={Users} label="Total" value={42} />);
    expect(screen.getByText("42").className).toContain("tabular-nums");
  });

  it("é canto de bloco, não painel — é cartão de resumo", () => {
    const { container } = render(<KpiCard icon={Users} label="Total" value={42} />);
    expect(container.firstElementChild!.className).toContain("rounded-block");
  });

  it("loading mostra skeleton no lugar do valor, mantendo o rótulo", () => {
    render(<KpiCard loading icon={Users} label="Total" value={0} />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.queryByText("0")).toBeNull();
  });

  it("KpiRow é grid de 2 colunas no mobile e 4 no desktop", () => {
    const { container } = render(<KpiRow><div /></KpiRow>);
    const cls = container.firstElementChild!.className;
    expect(cls).toContain("grid-cols-2");
    expect(cls).toContain("sm:grid-cols-4");
  });
});
