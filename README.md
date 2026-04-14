# Zapzinho Server

API REST para o Zapzinho CRM — leads, contatos, templates e campanhas de disparo em massa via WhatsApp (W-API).

**Stack:** Fastify 4 · TypeScript 5 · Prisma 7 · PostgreSQL · node-cron · W-API

---

## Requisitos

- **Node 20+**
- **npm 9+**
- **PostgreSQL 15+** — local ou via Docker (docker-compose incluso)

---

## Instalação

```bash
cd zapzinho-server
npm install
```

---

## Variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.exemple .env
```

Preencha o `.env`:

```env
# Banco de dados
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/BANCO"

# Auth
JWT_SECRET="troque-por-uma-chave-forte"
NODE_ENV="dev"
PORT=3333

# Conta admin do seed
PASSWORD_ADMIN="Admin123"
ADMIN_EMAIL="admin@exemplo.com"

# W-API (WhatsApp)
WAPI_BASE_URL="https://api.w-api.app/v1"
WAPI_INSTANCE_ID="seu-instance-id"   # painel W-API → Instâncias
WAPI_TOKEN="seu-token"               # painel W-API → API Key
WAPI_DELAY_MS=1500                   # intervalo (ms) entre mensagens de broadcast
```

> **WAPI_INSTANCE_ID** e **WAPI_TOKEN** estão no painel da W-API em [w-api.app](https://w-api.app).  
> **WAPI_DELAY_MS** controla o ritmo de envio nos broadcasts para evitar bloqueio do WhatsApp (mínimo recomendado: 1000 ms).

---

## Banco de dados

### Opção A — Docker (recomendado para dev)

```bash
docker-compose up -d
```

Isso sobe um PostgreSQL na porta `5432` usando as variáveis do `.env`.

### Opção B — PostgreSQL local

Crie o banco manualmente e ajuste `DATABASE_URL` no `.env`.

---

## Migrations e seed

```bash
# Criar tabelas
npx prisma migrate dev

# Popular banco com contas de teste
npm run seeds
```

### Contas criadas pelo seed

| Perfil  | E-mail                       | Senha      |
|---------|------------------------------|------------|
| Admin   | andreferreiradaweb@gmail.com | (valor de `PASSWORD_ADMIN` no `.env`) |
| Cliente | cliente@teste.com            | Teste123   |

---

## Rodar em desenvolvimento

```bash
npm run dev
```

Servidor disponível em `http://localhost:3333` (ou a porta definida em `PORT`).

---

## Outros comandos

```bash
npm run build          # Compila para ./build
npm run lint           # ESLint com autofix
npm run seeds          # Executa seeds manualmente
npm run test           # Testes (vitest)
npm run test:coverage  # Cobertura de testes
```

---

## Estrutura do projeto

```
src/
  config/          # validatedEnv.ts (Zod) — nunca usar process.env diretamente
  error/           # Erros tipados (ResourceNotFound, InvalidCredentials, etc.)
  factory/         # Wiring use-case + repositórios
  http/
    controllers/   # Parse de request → chama factory → resposta
  jobs/            # Cron jobs (reactivation.ts, trial-expiry.ts, index.ts)
  lib/             # Cliente Prisma
  repositories/    # Interfaces + implementações Prisma
  services/        # wapi.ts (mensagens WhatsApp)
  use-cases/       # Lógica de negócio
prisma/
  schema.prisma    # Modelos do banco
  seeds.ts         # Dados iniciais
```

---

## Cron jobs automáticos

| Job             | Horário    | O que faz                                                         |
|-----------------|------------|-------------------------------------------------------------------|
| Reativação      | 09:00 diário | Envia WhatsApp a usuários sem mensagem de onboarding há 3+ dias |
| Trial expiry    | 10:00 diário | Envia upsell a usuários com trial expirando em até 2 dias       |
