import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SectionCard } from "./SectionCard";
import { DataRow } from "./DataRow";
import { Field } from "./Field";

function Exemplo({ onSave }: { onSave?: (p: Record<string, unknown>) => Promise<void> }) {
  return (
    <SectionCard label="DEMOGRÁFICOS" editable values={{ genero: "Feminino" }} onSave={onSave}>
      {({ editing, values, set }) =>
        editing ? (
          <Field label="Gênero">
            <input value={values.genero} onChange={(e) => set("genero", e.target.value)} />
          </Field>
        ) : (
          <DataRow label="Gênero" value={values.genero} />
        )
      }
    </SectionCard>
  );
}

describe("SectionCard", () => {
  it("começa em leitura e mostra Editar", () => {
    render(<Exemplo />);
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Salvar" })).toBeNull();
  });

  it("sem editable não mostra Editar", () => {
    render(
      <SectionCard label="X" values={{ a: 1 }}>
        {() => <DataRow label="A" value="1" />}
      </SectionCard>
    );
    expect(screen.queryByRole("button", { name: "Editar" })).toBeNull();
  });

  it("Editar troca para campos e foca o primeiro", async () => {
    render(<Exemplo />);
    await userEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Gênero")).toHaveFocus());
  });

  it("Salvar envia só o que mudou", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<Exemplo onSave={onSave} />);
    await userEvent.click(screen.getByRole("button", { name: "Editar" }));
    await userEvent.clear(screen.getByLabelText("Gênero"));
    await userEvent.type(screen.getByLabelText("Gênero"), "Masculino");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(onSave).toHaveBeenCalledWith({ genero: "Masculino" });
  });

  it("sucesso volta para leitura", async () => {
    render(<Exemplo onSave={vi.fn().mockResolvedValue(undefined)} />);
    await userEvent.click(screen.getByRole("button", { name: "Editar" }));
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument()
    );
  });

  // Regressão: o efeito de resync com a prop `values` não pode sobrescrever
  // o estado recém-salvo com o valor antigo quando `editing` transiciona
  // para false por causa de um save bem-sucedido.
  it("sucesso mostra o valor NOVO em leitura, não o antigo", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<Exemplo onSave={onSave} />);
    await userEvent.click(screen.getByRole("button", { name: "Editar" }));
    await userEvent.clear(screen.getByLabelText("Gênero"));
    await userEvent.type(screen.getByLabelText("Gênero"), "Masculino");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument()
    );
    expect(screen.getByText("Masculino")).toBeInTheDocument();
    expect(screen.queryByText("Feminino")).toBeNull();
  });

  // O requisito mais importante desta task: falha NÃO pode perder o que foi
  // digitado. Ver spec §7.2.
  it("erro mantém a seção em edição com o texto digitado", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("403"));
    render(<Exemplo onSave={onSave} />);
    await userEvent.click(screen.getByRole("button", { name: "Editar" }));
    await userEvent.clear(screen.getByLabelText("Gênero"));
    await userEvent.type(screen.getByLabelText("Gênero"), "Não-binário");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled()
    );
    expect(screen.getByLabelText("Gênero")).toHaveValue("Não-binário");
  });

  it("Cancelar sem alteração volta direto, sem perguntar", async () => {
    render(<Exemplo />);
    await userEvent.click(screen.getByRole("button", { name: "Editar" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
  });

  it("Cancelar com alteração pede confirmação", async () => {
    render(<Exemplo />);
    await userEvent.click(screen.getByRole("button", { name: "Editar" }));
    await userEvent.type(screen.getByLabelText("Gênero"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("emite h2 — a hierarquia não pula nível abaixo do h1 do PageHeader", () => {
    render(<Exemplo />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("DEMOGRÁFICOS");
  });
});
