import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar } from "./FilterBar";

const filtros = [
  {
    key: "status",
    label: "Status",
    value: "",
    onChange: vi.fn(),
    options: [
      { value: "todos", label: "Todos" },
      { value: "ACTIVE", label: "Ativo" },
    ],
  },
];

describe("FilterBar", () => {
  it("dispara onSearchChange a cada tecla — o debounce é da página", async () => {
    const onSearchChange = vi.fn();
    render(<FilterBar search="" onSearchChange={onSearchChange} />);
    await userEvent.type(screen.getByRole("searchbox"), "an");
    expect(onSearchChange).toHaveBeenCalledTimes(2);
  });

  it("o X de limpar só aparece com texto", async () => {
    const { rerender } = render(<FilterBar search="" onSearchChange={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /limpar busca/i })).toBeNull();
    rerender(<FilterBar search="ana" onSearchChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /limpar busca/i })).toBeInTheDocument();
  });

  it("conta os filtros ativos", () => {
    render(
      <FilterBar
        search="ana"
        onSearchChange={vi.fn()}
        filters={[{ ...filtros[0], value: "ACTIVE" }]}
      />
    );
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("o botão Limpar tudo só existe com filtro ativo", () => {
    const { rerender } = render(
      <FilterBar search="" onSearchChange={vi.fn()} filters={filtros} />
    );
    expect(screen.queryByRole("button", { name: /limpar tudo/i })).toBeNull();
    rerender(
      <FilterBar search="ana" onSearchChange={vi.fn()} filters={filtros} onClear={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: /limpar tudo/i })).toBeInTheDocument();
  });

  it("a busca tem rótulo acessível", () => {
    render(<FilterBar search="" onSearchChange={vi.fn()} searchPlaceholder="Buscar membro" />);
    expect(screen.getByRole("searchbox")).toHaveAccessibleName();
  });
});
