# CLAUDE.md

Contexto rápido para IA. Para entendimento completo, **sempre ler `docs/ARCHITECTURE.md` primeiro**.

## O que é

Plataforma interna do clube **Inteli Blockchain** (Messias é presidente) para substituir planilhas: membros, processo seletivo, PDI. MVP completo. Próxima fase planejada: agendar reuniões via Google Calendar (schema + scope OAuth `calendar.events` já preparados).

## Stack

- **Frontend** — Next.js 16.x (App Router), React 19, Tailwind v4, TS — Docker via GHCR, deploy na VPS pelo Easypanel (root: `frontend`).
- **Backend** — NestJS 11, Prisma 6, TS — Docker via GHCR, deploy na VPS pelo Easypanel.
- **Banco** — Postgres auto-hospedado na mesma VPS, como serviço do Easypanel (sem pooler).
- **Auth** — Google OAuth 2.0, domínio `@sou.inteli.edu.br`.

## Workflow obrigatório

Fluxo **superpowers**, sem exceção: `brainstorming` → spec → `writing-plans` → plano → execução (`executing-plans` ou `subagent-driven-development`). Cada etapa espera aprovação antes da seguinte.

- Specs em `docs/superpowers/specs/`, planos em `docs/superpowers/plans/`.
- `docs/superpowers/` é **gitignored** — specs e planos são artefatos locais de uma sessão, não documentação do repo.
- A documentação versionada do sistema é o `docs/ARCHITECTURE.md`. Ao implementar algo que mude arquitetura, schema ou endpoints, atualize **esse** arquivo — nunca deixe a verdade do sistema morar num artefato de sessão.

Pular o fluxo só para: typo, ajuste óbvio em 1 arquivo, exploração/audit.

## Fluxo de git

`develop` é a branch padrão e o alvo de **todo** PR. `main` é produção: push nela dispara o deploy para o GHCR (`.github/workflows/deploy-*.yml`, filtrados por `frontend/**` e `backend/**`).

**Nunca commite direto em `main` nem em `develop`.**

Trabalho de agente roda em worktree isolada, para não disputar a árvore de trabalho com o usuário:

```bash
git worktree add .worktrees/<slug> -b <tipo>/<slug> develop
cd .worktrees/<slug>
# implementa, commita em fases
git push -u origin <tipo>/<slug>
gh pr create --base develop
```

`.worktrees/` é gitignored. Ao fim: `git worktree remove .worktrees/<slug>`.

`develop` → `main` é decisão de release, não de feature: acumula o que já foi aprovado e sobe num PR só — que é o que dispara o deploy.

Commits em conventional commits com descrição em português: `feat: adiciona Badge`, `fix: corrige contraste do botão primário`.

## Regras técnicas críticas

1. **Autenticação por cookie de sessão httpOnly.** O callback do Google cria uma linha em `Session` e emite o cookie `session` (7 dias deslizantes). `SessionGuard` valida a sessão; `AuthGuard` estende ele exigindo `status === 'APPROVED'`. Role é sempre lida do banco — nenhum header de cliente influencia identidade ou permissão. Ver `backend/src/modules/auth/session.guard.ts`.
2. **SSR-safe**: nunca `typeof window !== 'undefined'` no render. Páginas com guard retornam `null` enquanto carrega (sem flash).
3. **Resposta API**: tudo envelopado por `ResponseInterceptor` — `{status, message, success, data, error, meta}`. Frontend lê `response.data?.data`.
4. **PDI auto-revisão**: `PATCH /pdi/:id` cria `PdiEntryRevision` em `$transaction` (timeout 30s) quando `content` muda. `authorId`/`editorId` **nullable** (`onDelete: SetNull`).
5. **Paginação por cursor** em todas listagens: `cursor`, `limit`, `sort`, `direction`. `meta.nextCursor` no retorno.
6. **Frontend Next.js**: ler `frontend/AGENTS.md` — esta versão tem breaking changes vs treino comum, consultar `node_modules/next/dist/docs/` antes de mexer em APIs novas do framework.

## Arquivos de referência

| Onde | O que |
|------|-------|
| `docs/ARCHITECTURE.md` | Fonte de verdade versionada: 16 modelos Prisma, 9 enums, RBAC, 44+ endpoints, regras do seed |
| `backend/prisma/schema.prisma` | Schema fonte da verdade |
| `backend/README.md` / `frontend/README.md` | Detalhes de cada camada |
| Swagger | `http://localhost:3001/docs` ou `https://api-pessoas.inteliblockchain.org/docs` |

## Setup rápido

```bash
npm install --prefix backend
npm install --prefix frontend
# backend/.env e frontend/.env conforme README.md
cd backend && npx prisma migrate deploy && npx ts-node scripts/seed.ts
cd .. && npm run dev   # frontend :3000, backend :3001
# Primeiro acesso pós-seed:
# http://localhost:3000/dashboard?userId=00000000-0000-0000-0000-000000000001&role=ADMIN
```
