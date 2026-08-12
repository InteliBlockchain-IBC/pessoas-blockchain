// Uma seção em edição por vez (spec §7.2). Estes testes cobrem a coordenação
// entre DUAS instâncias de SectionCard dentro do mesmo DirtyGuard — o cenário
// que só passou a existir de verdade com members/[id]/page.tsx (Task 19).
// Os testes de SectionCard.test.tsx cobrem uma instância isolada e continuam
// sem DirtyGuard, exercitando o fallback "sem provider".
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SectionCard } from "./SectionCard";
import { DirtyGuard } from "./DirtyGuard";
import { DataRow } from "./DataRow";
import { Field } from "./Field";

function Secao({ rotulo, valorInicial }: { rotulo: string; valorInicial: string }) {
  return (
    <SectionCard label={rotulo} editable values={{ campo: valorInicial }}>
      {({ editing, values, set }) =>
        editing ? (
          <Field label={`Campo ${rotulo}`}>
            <input value={values.campo} onChange={(e) => set("campo", e.target.value)} />
          </Field>
        ) : (
          <DataRow label={`Campo ${rotulo}`} value={values.campo} />
        )
      }
    </SectionCard>
  );
}

function DuasSecoes() {
  return (
    <DirtyGuard>
      <Secao rotulo="A" valorInicial="valor-a" />
      <Secao rotulo="B" valorInicial="valor-b" />
    </DirtyGuard>
  );
}

describe("SectionCard + DirtyGuard — uma seção em edição por vez", () => {
  it("editar a segunda seção com a primeira suja pede confirmação", async () => {
    render(<DuasSecoes />);
    await userEvent.click(screen.getAllByRole("button", { name: "Editar" })[0]);
    await userEvent.type(screen.getByLabelText("Campo A"), "x");

    // única "Editar" restante é a de B, já que A virou Cancelar/Salvar
    await userEvent.click(screen.getByRole("button", { name: "Editar" }));

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Outra seção está em edição")).toBeInTheDocument();
    // B ainda não abriu — a confirmação vem ANTES de entrar em modo edição
    expect(screen.queryByLabelText("Campo B")).toBeNull();
  });

  it("confirmar descarta o rascunho da primeira e abre a segunda", async () => {
    render(<DuasSecoes />);
    await userEvent.click(screen.getAllByRole("button", { name: "Editar" })[0]);
    await userEvent.type(screen.getByLabelText("Campo A"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Editar" }));
    await userEvent.click(screen.getByRole("button", { name: "Descartar e editar" }));

    await waitFor(() => expect(screen.getByLabelText("Campo B")).toBeInTheDocument());
    // A voltou pra leitura com o valor original, sem o "x" digitado
    expect(screen.queryByLabelText("Campo A")).toBeNull();
    expect(screen.getByText("valor-a")).toBeInTheDocument();
  });

  it("cancelar não abre a segunda e mantém a primeira suja como estava", async () => {
    render(<DuasSecoes />);
    await userEvent.click(screen.getAllByRole("button", { name: "Editar" })[0]);
    await userEvent.type(screen.getByLabelText("Campo A"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Editar" }));

    const dialogo = screen.getByRole("alertdialog");
    await userEvent.click(within(dialogo).getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.queryByLabelText("Campo B")).toBeNull();
    expect(screen.getByLabelText("Campo A")).toHaveValue("valor-ax");
  });

  it("sem seção suja, editar qualquer uma abre direto sem confirmação", async () => {
    render(<DuasSecoes />);
    await userEvent.click(screen.getAllByRole("button", { name: "Editar" })[0]);
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.getByLabelText("Campo A")).toBeInTheDocument();
  });
});
