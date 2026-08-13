import { itensVisiveis, PESSOAS } from "./nav-config";

const hrefs = (papel: Parameters<typeof itensVisiveis>[0]) =>
  itensVisiveis(papel).flatMap((g) => g.itens.map((i) => i.href));

describe("itensVisiveis", () => {
  it("todo mundo vê o dashboard", () => {
    expect(hrefs("")).toContain("/dashboard");
    expect(hrefs("INTERVIEWER")).toContain("/dashboard");
  });

  it("entrevistador não vê membros, seleção nem usuários", () => {
    const h = hrefs("INTERVIEWER");
    expect(h).not.toContain("/members");
    expect(h).not.toContain("/selection");
    expect(h).not.toContain("/admin/users");
  });

  it("PEOPLE vê membros e seleção", () => {
    const h = hrefs("PEOPLE");
    expect(h).toContain("/members");
    expect(h).toContain("/selection");
  });

  it("ADMIN vê tudo, inclusive usuários", () => {
    expect(hrefs("ADMIN")).toContain("/admin/users");
  });

  // Regressão do comportamento atual: hoje o Sidebar mostra /admin/users para
  // PEOPLE também, mas a página em si só deixa ADMIN mudar papel. Manter o
  // item visível para PEOPLE é o comportamento existente — não mude aqui.
  it("PEOPLE continua vendo o item de usuários, como hoje", () => {
    expect(hrefs("PEOPLE")).toContain("/admin/users");
  });

  it("nenhum grupo vazio é devolvido", () => {
    for (const papel of ["", "ADMIN", "PEOPLE", "INTERVIEWER"] as const) {
      expect(itensVisiveis(papel).every((g) => g.itens.length > 0)).toBe(true);
    }
  });
});

describe("PESSOAS", () => {
  it("inclui ADMIN e PEOPLE, nao INTERVIEWER", () => {
    expect(PESSOAS).toContain("ADMIN");
    expect(PESSOAS).toContain("PEOPLE");
    expect(PESSOAS).not.toContain("INTERVIEWER");
  });
});
