import { montarPayload } from "./section-payload";

describe("montarPayload", () => {
  it("só inclui o que mudou — o PATCH é parcial", () => {
    const inicial = { nome: "Ana", cargo: "HEAD", genero: "Feminino" };
    const rascunho = { nome: "Ana", cargo: "DIRECTOR", genero: "Feminino" };
    expect(montarPayload(inicial, rascunho)).toEqual({ cargo: "DIRECTOR" });
  });

  it("não envia nada quando nada mudou", () => {
    const x = { nome: "Ana" };
    expect(montarPayload(x, { ...x })).toEqual({});
  });

  // O ponto que a spec §7.4 marca como armadilha: no Prisma, `undefined`
  // NÃO TOCA o campo e `null` o LIMPA. Um select esvaziado tem que virar
  // null, senão "limpar departamento" é um no-op silencioso.
  it("campo esvaziado vira null explícito, nunca undefined nem string vazia", () => {
    const inicial = { departamento: "PROJECTS" };
    const rascunho = { departamento: "" };
    const payload = montarPayload(inicial, rascunho);
    expect(payload).toEqual({ departamento: null });
    expect("departamento" in payload).toBe(true);
    expect(payload.departamento).not.toBe(undefined);
  });

  it("campo que já era nulo e continua nulo não entra no payload", () => {
    const inicial = { departamento: null };
    const rascunho = { departamento: "" };
    expect(montarPayload(inicial, rascunho)).toEqual({});
  });

  it("preenche um campo que era nulo", () => {
    const inicial = { departamento: null };
    const rascunho = { departamento: "PEOPLE" };
    expect(montarPayload(inicial, rascunho)).toEqual({ departamento: "PEOPLE" });
  });

  it("array só entra quando o conteúdo muda, não a identidade", () => {
    const inicial = { interesses: ["A", "B"] };
    expect(montarPayload(inicial, { interesses: ["A", "B"] })).toEqual({});
    expect(montarPayload(inicial, { interesses: ["A"] })).toEqual({ interesses: ["A"] });
  });

  it("false é valor válido e não é confundido com vazio", () => {
    const inicial = { isLgbtqia: true };
    expect(montarPayload(inicial, { isLgbtqia: false })).toEqual({ isLgbtqia: false });
  });
});
