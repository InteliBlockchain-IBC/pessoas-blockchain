import { render, screen } from "@testing-library/react";
import { DataRow, LINHA_ALTURA } from "./DataRow";
import { Field } from "./Field";

describe("DataRow / Field", () => {
  it("valor ausente vira travessão, não string vazia", () => {
    render(<DataRow label="Cargo" />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("valor presente aparece", () => {
    render(<DataRow label="Cargo" value="Head" />);
    expect(screen.getByText("Head")).toBeInTheDocument();
  });

  // Este é o teste que sustenta o requisito de "sem salto de layout" da
  // spec §7.3: se DataRow e Field divergirem em altura, a troca
  // leitura<->edição passa a mexer na altura do card.
  it("DataRow e Field compartilham a mesma classe de altura de linha", () => {
    const { container: a } = render(<DataRow label="Cargo" value="Head" />);
    const { container: b } = render(
      <Field label="Cargo"><input /></Field>
    );
    expect(a.firstElementChild?.className).toContain(LINHA_ALTURA);
    expect(b.firstElementChild?.className).toContain(LINHA_ALTURA);
  });

  it("o erro do Field nunca é só a borda vermelha — tem texto e ícone", () => {
    const { container } = render(
      <Field label="Email" error="Email inválido"><input id="e" /></Field>
    );
    expect(screen.getByText("Email inválido")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("o campo é descrito pelo erro e marcado como inválido", () => {
    render(<Field label="Email" error="Email inválido"><input id="e" /></Field>);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toBeTruthy();
  });
});
