/**
 * Monta o payload parcial de uma seção.
 *
 * PATCH /members/:id é genuinamente parcial: UpdateMemberDto declara os 12
 * campos com @IsOptional() e members.repository.ts:128 mapeia campo a campo
 * para o prisma.member.update, onde `undefined` é ignorado. Verificado em
 * 11/08/2026, não presumido.
 *
 * A armadilha: `undefined` NÃO TOCA o campo, `null` o LIMPA. Um <select>
 * esvaziado devolve "", e "" precisa virar `null` — senão "limpar
 * departamento" vira um no-op silencioso. @IsOptional() do class-validator
 * aceita `null`, e o Prisma o traduz para NULL.
 */
const vazio = (v: unknown) => v === "" || v === undefined || v === null;

const igual = (a: unknown, b: unknown): boolean => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((x, i) => x === b[i]);
  }
  return a === b;
};

export function montarPayload<T extends object>(inicial: T, rascunho: T): Partial<T> {
  const payload: Partial<T> = {};
  for (const chave of Object.keys(rascunho) as (keyof T)[]) {
    const antes = inicial[chave];
    const depois = rascunho[chave];

    // Ambos vazios (null, undefined ou "") — nada mudou de fato.
    if (vazio(antes) && vazio(depois)) continue;
    if (igual(antes, depois)) continue;

    payload[chave] = (vazio(depois) ? null : depois) as T[keyof T];
  }
  return payload;
}
