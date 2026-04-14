# CLAUDE.md — Zapzinho Server

## Project Overview
Fastify + TypeScript + Prisma (PostgreSQL) REST API for a generic CRM with WhatsApp mass messaging via W-API.

## Stack
- **Runtime:** Node 20, TypeScript 5
- **Framework:** Fastify 4 + @fastify/jwt + @fastify/cors
- **ORM:** Prisma 7 with PrismaPg adapter
- **Validation:** Zod (always — no raw req.body)
- **Hashing:** bcrypt
- **Scheduling:** node-cron
- **WhatsApp:** W-API (src/services/wapi.ts)

## Architecture Pattern
```
Controller → Factory → UseCase → Repository (interface) → PrismaRepository
```
- **Controllers** (`src/http/controllers/<domain>/`): parse + validate request, call factory, return response
- **Use-cases** (`src/use-cases/<domain>/`): business logic, throw typed errors
- **Repositories** (`src/repositories/<domain>.ts`): interfaces only
- **Prisma repos** (`src/repositories/prisma/<domain>.ts`): Prisma implementations
- **Factories** (`src/factory/<domain>/`): wire use-case + repos together

## Key Rules for Claude

1. **Always use Zod** to validate request body/params before calling use-cases.
2. **Typed errors only** — throw from `src/error/` (e.g. `ResourceNotFound`, `UserAlreadyExistsError`). Never throw raw strings.
3. **Factory pattern** — every controller must call a `Make*` factory, never instantiate repos directly.
4. **No business logic in controllers** — controllers only parse, call use-case, return reply.
5. **env via `validatedEnv.ts`** — never read `process.env` directly in other files.
6. **Prisma client** — always import from `@/lib/prisma`, never from generated path directly.
7. **W-API calls** — always go through `src/services/wapi.ts`, never inline fetch to W-API.
8. **Message logs** — every WhatsApp message sent must be logged via `MessageLog` model.
9. **Cron jobs** — all scheduled work lives in `src/jobs/`. Register them in `src/server.ts`.
10. **Routes** — registered in per-domain `routes.ts`, imported in `src/app.ts`.

## Domain Models
- **User** — system users (admins + clients). Has `trialExpiresAt`, `onboardingMessageSentAt`.
- **Contact** — CRM contacts to receive WhatsApp messages. Belongs to a User. Has `tags[]`.
- **MessageTemplate** — reusable message templates. Belongs to a User.
- **Broadcast** — mass send campaign. Status: DRAFT → SENDING → SENT/FAILED.
- **BroadcastContact** — junction of Broadcast ↔ Contact with per-contact delivery status.
- **MessageLog** — audit log of every message dispatched (type: ONBOARDING/BROADCAST/etc).

## Env Variables
```
DATABASE_URL
JWT_SECRET
NODE_ENV
PORT
PASSWORD_ADMIN
ADMIN_EMAIL
N8N_WEBHOOK_LEAD_NOTIFY   # optional
WAPI_BASE_URL             # e.g. https://api.w-api.app/v1
WAPI_TOKEN              # apikey header value
WAPI_INSTANCE_ID          # instanceId query param
WAPI_DELAY_MS             # delay between broadcast messages (default 1500)
```

> N8N was removed — lead notifications now go through W-API only.

## Broadcast Flow
1. Create broadcast (DRAFT) with message + contact IDs or tag filter
2. Call `POST /broadcast/:id/send` → status → SENDING
3. Server sends messages one-by-one with `WAPI_DELAY_MS` delay (rate limiting)
4. Each send: updates `BroadcastContact.status` + inserts `MessageLog`
5. After all done: status → SENT, sets `finishedAt`, `totalSent`, `totalFailed`

## Cron Jobs
- **Reactivation** — daily at 09:00: finds users with `onboardingMessageSentAt IS NULL` and `createdAt <= now - 3 days`, sends reminder via W-API.
- **Trial expiry** — daily at 10:00: finds users with `trialExpiresAt` within next 2 days, sends upsell message.
