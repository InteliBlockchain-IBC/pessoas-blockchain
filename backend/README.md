# Backend — Inteli Blockchain Gestão de Pessoas

API RESTful construída com NestJS 11 + Prisma 6 + PostgreSQL (auto-hospedado).

## Stack

- **Runtime:** Node.js 20
- **Framework:** NestJS 11
- **ORM:** Prisma 6.x
- **Banco:** PostgreSQL 15 auto-hospedado na VPS (Docker, sem pooler)
- **Auth:** Google OAuth 2.0 (`google-auth-library`) + sessão em cookie httpOnly (model `Session`)
- **Docs:** Swagger em `/docs`
- **Testes:** Jest + ts-jest (59 testes unitários em 6 suites)
- **Deploy:** Docker via GitHub Actions + Easypanel

## Setup

```bash
npm install
cp .env.example .env   # editar com suas credenciais

# a partir da raiz do repo: sobe um Postgres local pro dev
docker compose up -d db

npx prisma migrate deploy        # aplicar migrations
npx prisma generate              # gerar Prisma client
npx ts-node scripts/seed.ts      # popular banco com dados reais

npm run start:dev                # rodar com hot reload em localhost:3001
```

## Variáveis de Ambiente

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gestao_pessoas?schema=public"
PORT=3001
NODE_ENV=development
GOOGLE_CLIENT_ID="<id>.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="<secret>"
GOOGLE_OAUTH_REDIRECT_URI="http://localhost:3001/auth/google/callback"
FRONTEND_URL="http://localhost:3000"

# Dominio do cookie de sessao. Vazio em dev (cookie fica preso ao host que
# emitiu). Em producao: .inteliblockchain.org (front e API sao subdominios).
COOKIE_DOMAIN=
```

## Arquitetura

### Padrão por módulo

```
Controller → Service → Repository → PrismaService → PostgreSQL
     │
     ├── SessionGuard (valida cookie `session` contra o model Session → seta request.user)
     ├── AuthGuard (estende SessionGuard → exige request.user.status === 'APPROVED')
     ├── RolesGuard (@Roles() → verifica request.user.role)
     └── DTOs (class-validator, whitelist, forbidNonWhitelisted)
```

### Módulos

| Módulo | Responsabilidade | Rotas |
|--------|-----------------|-------|
| `auth` | Google OAuth 2.0, sessão em cookie httpOnly | 4 |
| `users` | CRUD usuários, aprovação, roles | 4 |
| `members` | CRUD membros, filtros, assignments | 8 |
| `selection` | Processos, etapas, questões, candidaturas, resultados, avaliações, respostas | 24+ |
| `pdi` | Plano de Desenvolvimento Individual com auto-revisão em transação | 5 |
| `import-export` | Import xlsx/csv, export csv/pdf | 6 |

### Shared

| Componente | Função |
|-----------|--------|
| `PrismaService` | `@Global()` — injetável em qualquer módulo sem importar PrismaModule |
| `ResponseInterceptor` | Envelopa **todas** as respostas: `{status, message, success, data, error, meta}` |
| `HttpExceptionFilter` | Mapeia erros para: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR` |
| `SessionGuard` | Valida o cookie `session` contra o model `Session` — não checa `status` (usado por `/auth/me` e `/auth/logout`) |
| `AuthGuard` | Estende `SessionGuard` — exige `status === 'APPROVED'`. Role e status sempre lidos do banco |
| `RolesGuard` | Verifica `request.user.role` contra `@Roles()` decorator |

## Padrão de Resposta

Todas as respostas seguem o envelope (sucesso e erro):

```json
{
  "status": 200,
  "message": "OK",
  "success": true,
  "data": { ... },
  "error": null,
  "meta": { "nextCursor": "...", "limit": 20 }
}
```

O frontend sempre lê `response.data?.data`.

## Autenticação por Sessão (Cookie httpOnly)

```
GET /auth/google/callback (troca code, valida dominio, upsert User/Account)
        → SessionService.create(userId): cria linha em Session, token opaco 256 bits
        → res.cookie('session', token, { httpOnly, sameSite: lax, maxAge: 7d, secure em prod })
        → redirect /dashboard (APPROVED) ou /pendente (PENDING)

Request subsequente → cookie `session` (enviado pelo browser, sem header manual)
        → SessionGuard: valida token contra Session, renova `expires` (sliding)
          quando resta < metade da janela de 7 dias
        → 401 se cookie ausente, sessao invalida ou expirada
        → request.user = { id, role, status, name, email, image }  ← tudo do banco

AuthGuard estende SessionGuard:
        → 403 se request.user.status !== 'APPROVED'
```

Role e status são sempre lidos do banco a cada request — não existe mais header de identidade (`x-user-id` foi removido). Ver `src/modules/auth/session.service.ts`, `session.guard.ts`, `session.cookie.ts`, `auth.guard.ts`.

## RBAC

| Endpoint | ADMIN | PEOPLE | INTERVIEWER |
|----------|:-----:|:------:|:-----------:|
| GET /members | ✅ | ✅ | ✅ |
| POST/PATCH /members | ✅ | ✅ | ❌ |
| GET /selection/* | ✅ | ✅ | ✅ |
| POST/PATCH /selection/* (avaliações) | ✅ | ✅ | ✅ |
| POST/PATCH /selection/* (outros) | ✅ | ✅ | ❌ |
| GET/POST/PATCH /pdi | ✅ | ✅ | ❌ |
| GET/PATCH /users | ✅ | ✅ | ❌ |
| PATCH /users/:id/role | ✅ | ❌ | ❌ |
| Import/Export | ✅ | ✅ | ❌ |

## Endpoints

### Auth
```
GET  /auth/google                → redirect Google OAuth (público)
GET  /auth/google/callback       → callback OAuth: cria Session, emite cookie (público)
GET  /auth/me                    → usuário autenticado (SessionGuard — funciona com status PENDING)
POST /auth/logout                → revoga a Session atual e limpa o cookie (SessionGuard)
```

### Users
```
GET    /users
GET    /users/:id
PATCH  /users/:id/approve        → ADMIN, PEOPLE
PATCH  /users/:id/role           → ADMIN
```

### Members
```
GET    /members                  → cursor pagination + filtros (q, status, department, position, interests)
POST   /members                  → ADMIN, PEOPLE
GET    /members/:id
PATCH  /members/:id              → ADMIN, PEOPLE
PATCH  /members/:id/status       → ADMIN, PEOPLE
GET    /members/:id/assignments
POST   /members/:id/assignments  → ADMIN, PEOPLE
PATCH  /members/assignments/:id  → ADMIN, PEOPLE
```

### Selection
```
GET    /selection/processes
POST   /selection/processes               → ADMIN, PEOPLE
GET    /selection/processes/:id           → inclui stages + questions
PATCH  /selection/processes/:id           → ADMIN, PEOPLE

GET    /selection/processes/:id/stages
POST   /selection/processes/:id/stages    → ADMIN, PEOPLE
PATCH  /selection/stages/:id              → ADMIN, PEOPLE

GET    /selection/stages/:id/questions
POST   /selection/stages/:id/questions    → ADMIN, PEOPLE
PATCH  /selection/questions/:id           → ADMIN, PEOPLE

GET    /selection/applications            → filtros por processId, memberId, status
POST   /selection/applications            → ADMIN, PEOPLE
GET    /selection/applications/:id        → inclui answers + evaluations
PATCH  /selection/applications/:id/submit
PATCH  /selection/applications/:id/status → ADMIN, PEOPLE

GET    /selection/applications/:id/results
PATCH  /selection/applications/:id/results/:stageId  → ADMIN, PEOPLE

GET    /selection/applications/:id/answers
POST   /selection/applications/:id/answers
PATCH  /selection/applications/:id/answers/:questionId

GET    /selection/applications/:id/evaluations
POST   /selection/applications/:id/evaluations        → ADMIN, PEOPLE, INTERVIEWER
PATCH  /selection/applications/:id/evaluations/:questionId → ADMIN, PEOPLE, INTERVIEWER
```

### PDI
```
GET    /pdi                      → filtro por memberId
POST   /pdi                      → ADMIN, PEOPLE
GET    /pdi/:id
PATCH  /pdi/:id                  → cria PdiEntryRevision se content mudou (transação 30s timeout)
POST   /pdi/:id/revisions        → ADMIN, PEOPLE
```

### Import / Export
```
POST   /import/members           → xlsx/csv → ADMIN, PEOPLE
POST   /import/selection         → xlsx/csv → ADMIN, PEOPLE
GET    /export/members/csv       → ADMIN, PEOPLE
GET    /export/members/:id/pdf   → ADMIN, PEOPLE
GET    /export/selection/:id/csv → ADMIN, PEOPLE
GET    /export/pdi/csv           → ADMIN, PEOPLE
```

## Paginação por Cursor

```
GET /members?cursor=<uuid>&limit=20&sort=createdAt&direction=asc
```

`meta` retorna: `nextCursor`, `prevCursor`, `limit`, `sort`.

## PDI — Auto-Revisão

`PATCH /pdi/:id` cria `PdiEntryRevision` automaticamente se `content` mudou.
Executado em `prisma.$transaction` (timeout 30s como margem de segurança para a revisão).

`authorId` e `editorId` são **nullable** — PDI funciona mesmo sem User válido no banco (migration `20260507091047_make_pdi_author_optional`).

## Seed

```bash
npx ts-node scripts/seed.ts
```

Lê `data/[CENTRAL] BLOCKCHAIN INTEGRANTES.xlsx` e `data/Aprovados 2026.xlsx`:

| Entidade | Qtd |
|----------|-----|
| Members | 41 |
| Processos Seletivos | 2 (PS 2026.1 e PS 2026.2 Ano) |
| Etapas | 5 (3 + 2) |
| Questões | 21 (12 + 9) |
| Candidaturas | 25 |
| Avaliações | 201 |
| Respostas | 70 |
| Users | Todos ACTIVE da diretoria Pessoas (PEOPLE) + admin (ADMIN) |

Admin UUID fixo: `00000000-0000-0000-0000-000000000001`

O seed imprime todos os `x-user-id` criados — usar para autenticar localmente via `?userId=&role=`.

## Testes

```bash
npm run test        # unitários (59 testes, 6 suites)
npm run test:cov    # com cobertura de código
npm run test:e2e    # end-to-end
```

Suites: App, GoogleOAuth, Users, Members, Selection, PDI.

## Deploy

Dockerfile: multi-stage (builder compila TypeScript + gera Prisma → runner Node 20 slim em produção). Migrations rodam automaticamente no start do container via `npx prisma migrate deploy && node dist/main` (ver Dockerfile CMD).
