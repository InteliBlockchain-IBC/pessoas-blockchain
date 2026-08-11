# Inteli Blockchain — Gestão de Pessoas

Plataforma interna para gerenciar a jornada dos integrantes do clube Inteli Blockchain. Centraliza processos seletivos, avaliações, feedbacks e Planos de Desenvolvimento Individual (PDI), substituindo planilhas isoladas.

## Stack

| Camada | Tecnologia | Deploy |
|--------|-----------|--------|
| Frontend | Next.js 15+ (App Router), React 19, Tailwind CSS v4, TypeScript | Docker via GHCR — Easypanel (VPS) |
| Backend | NestJS 11, TypeScript, Swagger, Prisma 6.x | Docker via GHCR — Easypanel (VPS) |
| Banco de Dados | PostgreSQL 15 (auto-hospedado) | Easypanel (VPS) |
| Auth | Google OAuth 2.0 + DB-validated header guard | `google-auth-library` |

## Estrutura do Monorepo

```
.
├── backend/          # API RESTful (NestJS + Prisma)
├── frontend/         # Interface web (Next.js App Router)
├── data/             # Planilhas xlsx para seed
├── docs/             # Documentação técnica (ARCHITECTURE.md)
└── package.json      # Scripts do monorepo
```

## Pré-requisitos

- Node.js 20+
- npm 10+
- Docker (para rodar o Postgres local via `docker compose up -d db`)
- Credenciais Google OAuth 2.0 (Google Cloud Console)

## Setup Local

### 1. Instalar dependências

```bash
git clone <repo>
cd gestao_pessoas
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configurar variáveis de ambiente

**Backend** — criar `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gestao_pessoas?schema=public"
PORT=3001
NODE_ENV=development
GOOGLE_CLIENT_ID="<seu-client-id>.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="<seu-client-secret>"
GOOGLE_OAUTH_REDIRECT_URI="http://localhost:3001/auth/google/callback"
FRONTEND_URL="http://localhost:3000"
```

**Frontend** — criar `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Aplicar migrations e popular banco

```bash
cd backend
npx prisma migrate deploy      # aplica todas as migrations
npx ts-node scripts/seed.ts    # popula com dados reais dos xlsx em data/
```

> O seed imprime todos os `x-user-id` criados. Use o ID do admin para o primeiro login local.

### 4. Rodar em desenvolvimento

```bash
# Da raiz — roda frontend (3000) e backend (3001) em paralelo
npm run dev

# Individualmente
npm run dev:front   # Next.js em localhost:3000
npm run dev:back    # NestJS em localhost:3001 (hot reload)
```

### 5. Primeiro acesso local

Após o seed, acesse:

```
http://localhost:3000/dashboard?userId=00000000-0000-0000-0000-000000000001&role=ADMIN
```

Isso inicializa a sessão no localStorage sem precisar de OAuth.

## Auth Flow

1. `GET /auth/google` → redireciona para consentimento Google
2. Google redireciona para `/auth/google/callback?code=...`
3. Backend troca code por tokens, faz upsert do User + Account no DB
4. Backend redireciona para `/dashboard?userId=<id>&role=<role>`
5. Frontend armazena `x-user-id` e `x-user-role` no localStorage
6. Cada request Axios envia `x-user-id` no header
7. `AuthGuard` valida o user no banco (role lida do DB, não do header)

**Domínio restrito:** apenas emails `@sou.inteli.edu.br` podem autenticar.

## Roles e Permissões

| Role | Acesso |
|------|--------|
| **ADMIN** | Irrestrito. Pode alterar roles de outros usuários. UUID fixo no seed: `00000000-0000-0000-0000-000000000001` |
| **PEOPLE** | Gerencia membros, PDI, processos seletivos e usuários (exceto alterar roles) |
| **INTERVIEWER** | Leitura de membros, leitura e avaliação de candidatos no processo seletivo |

## Deploy

Backend e frontend são buildados como imagens Docker pelo GitHub Actions, publicados no GHCR e deployados na VPS via Easypanel. Push em `main` que toque `backend/**` ou `frontend/**` builda, publica e dispara o deploy automaticamente. Guia completo (secrets, domínios, variáveis de ambiente): `docs/DEPLOY.md`.

- **Backend:** `https://api-pessoas.inteliblockchain.org` — migrations aplicadas automaticamente no start do container (`npx prisma migrate deploy && node dist/main`).
- **Frontend:** `https://pessoas.inteliblockchain.org` — `NEXT_PUBLIC_API_URL` é inlined no build (trocar exige novo push/rebuild).

## Comandos Úteis

```bash
# Backend
cd backend
npm run start:dev          # desenvolvimento com hot reload
npm run build              # compilar TypeScript
npm run test               # rodar 59 testes unitários
npx prisma studio          # GUI do banco de dados
npx ts-node scripts/seed.ts  # repopular banco com dados reais

# Frontend
cd frontend
npm run dev                # desenvolvimento
npm run build              # build de produção
npx tsc --noEmit           # verificar tipos TypeScript
```

## Documentação

- **Arquitetura completa:** `docs/ARCHITECTURE.md`
- **API Swagger:** `http://localhost:3001/docs` (local) ou `https://api-pessoas.inteliblockchain.org/docs`
- **Backend detalhado:** `backend/README.md`
- **Frontend detalhado:** `frontend/README.md`
