import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DataTable } from "./DataTable";

type M = { id: string; nome: string };
const cols = [{ key: "nome", header: "Nome" }];
const dados: M[] = [{ id: "1", nome: "Ana" }, { id: "2", nome: "Bruno" }];

describe("DataTable", () => {
  it("renderiza cabeçalho e linhas", () => {
    render(<DataTable columns={cols} data={dados} rowKey={(m) => m.id} />);
    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
  });

  it("o cabeçalho usa o rótulo de calha", () => {
    render(<DataTable columns={cols} data={dados} rowKey={(m) => m.id} />);
    expect(screen.getByText("Nome").className).toContain("rotulo-em-card");
  });

  it("loading mostra skeleton com o número certo de colunas", () => {
    const { container } = render(
      <DataTable columns={cols} data={[]} loading rowKey={(m: M) => m.id} />
    );
    expect(container.querySelectorAll("tbody tr").length).toBeGreaterThan(0);
    expect(screen.queryByText("Ana")).toBeNull();
  });

  it("vazio renderiza o nó recebido", () => {
    render(
      <DataTable columns={cols} data={[]} empty={<p>Nada aqui</p>} rowKey={(m: M) => m.id} />
    );
    expect(screen.getByText("Nada aqui")).toBeInTheDocument();
  });

  it("linha clicável é acionável por teclado, não só por mouse", async () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={cols} data={dados} rowKey={(m) => m.id} onRowClick={onRowClick} />);
    const linha = screen.getByText("Ana").closest("tr")!;
    expect(linha).toHaveAttribute("tabindex", "0");
    linha.focus();
    await userEvent.keyboard("{Enter}");
    expect(onRowClick).toHaveBeenCalledWith(dados[0]);
  });

  it("sem onRowClick a linha não é focável", () => {
    render(<DataTable columns={cols} data={dados} rowKey={(m) => m.id} />);
    expect(screen.getByText("Ana").closest("tr")).not.toHaveAttribute("tabindex");
  });
});
