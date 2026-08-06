# Deploy — GHCR + Easypanel

Backend e frontend são buildados como imagens Docker pelo GitHub Actions,
publicados no GHCR e deployados na VPS via Easypanel. Banco continua no
Supabase — nada muda lá.

## 1. GitHub — Secrets e Variables

Em Settings → Secrets and variables → Actions no repo
`InteliBlockchain-IBC/pessoas-blockchain`:

**Secrets** (aba "Secrets"):
- `EASYPANEL_BACKEND_DEPLOY_HOOK` — URL de deploy do app backend no Easypanel
  (Passo 3 abaixo mostra onde pegar).
- `EASYPANEL_FRONTEND_DEPLOY_HOOK` — URL de deploy do app frontend.

**Variables** (aba "Variables", não "Secrets" — não é sensível):
- `NEXT_PUBLIC_API_URL` — URL pública do backend (ex:
  `https://api.pessoas.seudominio.com`). Definir só depois de decidir o
  domínio (Passo 2). Enquanto não tiver domínio final, pode usar um
  placeholder e trocar depois — mas **trocar exige novo push/rebuild**,
  já que é inlined no JS do build, não lido em runtime.

Nenhum PAT é necessário — o push pro GHCR usa o `GITHUB_TOKEN` automático.

## 2. Domínios

Decidir os domínios de backend e frontend antes de seguir (ex:
`api.pessoas.seudominio.com` / `pessoas.seudominio.com`). Eles entram em:
- `NEXT_PUBLIC_API_URL` (variable do GitHub, acima)
- `FRONTEND_URL` e `GOOGLE_OAUTH_REDIRECT_URI` (env do app backend no
  Easypanel, Passo 4)
- Redirect URI autorizado no Google Cloud Console (OAuth client usado hoje)

## 3. Easypanel — apontar a imagem e pegar o webhook de deploy

Para cada app (backend e frontend) já criado no Easypanel:

1. Na aba **Source** do app, trocar o tipo pra **"Docker Image"** (não Git)
   e apontar pra:
   - backend: `ghcr.io/inteliblockchain-ibc/pessoas-backend:latest`
   - frontend: `ghcr.io/inteliblockchain-ibc/pessoas-frontend:latest`

   Como o pacote é público (Passo 5), **nenhuma credencial de registry é
   necessária** aqui — só a URL da imagem.

2. Na aba **Deploy** (ou **Webhooks**, dependendo da versão do Easypanel),
   copiar a **URL de deploy** do app (formato
   `http://<ip-da-vps>:3000/api/deploy/<token>`). Essa é a URL que vai pro
   secret `EASYPANEL_BACKEND_DEPLOY_HOOK` / `EASYPANEL_FRONTEND_DEPLOY_HOOK`
   no GitHub (Passo 1).

3. Na aba **Domains**, configurar o domínio decidido no Passo 2 (Easypanel
   provisiona HTTPS automaticamente via Let's Encrypt).

## 4. Easypanel — variáveis de ambiente de runtime

Na aba **Environment** de cada app, replicar o que hoje está nos secrets do
Fly / env da Vercel:

**Backend:**
```
DATABASE_URL=<a mesma URL do Supabase de hoje>
DIRECT_URL=<a mesma URL do Supabase de hoje>
PORT=3000
NODE_ENV=production
GOOGLE_CLIENT_ID=<o mesmo client ID de hoje>
GOOGLE_CLIENT_SECRET=<o mesmo secret de hoje>
GOOGLE_OAUTH_REDIRECT_URI=https://<domínio do backend>/auth/google/callback
FRONTEND_URL=https://<domínio do frontend>
```

**Frontend:** nenhuma env de runtime — `NEXT_PUBLIC_API_URL` já foi inlined
no build (Passo 1).

Atualizar também no Google Cloud Console (APIs & Services → Credentials) o
redirect URI autorizado pra bater com `GOOGLE_OAUTH_REDIRECT_URI` de cima.

## 5. GHCR — tornar os pacotes públicos

Isso só é possível **depois do primeiro push** de cada workflow (o pacote
nasce quando a primeira imagem é publicada). Depois do primeiro deploy:

1. GitHub → perfil da organização `InteliBlockchain-IBC` → aba **Packages**.
2. Abrir `pessoas-backend` → **Package settings** → **Change visibility** →
   **Public**. Repetir para `pessoas-frontend`.

Sem isso, o Easypanel não consegue puxar a imagem (fica como privada,
exigiria credencial de registry).

## 6. Primeiro deploy de ponta a ponta

Depois dos passos 1–5: qualquer push em `main` que toque `backend/**` ou
`frontend/**` builda, publica e dispara o deploy automaticamente. Pra forçar
manualmente sem mudar código: Actions → escolher o workflow → **Run workflow**
(usa o `workflow_dispatch`).
