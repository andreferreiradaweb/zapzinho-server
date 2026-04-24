# Plano de Cobertura de Testes — Zapzinho Server

## Status atual (2026-04-23)

135 testes passando em 17 arquivos.

### Domínios cobertos
| Domínio | Testes | Tipo |
|---|---|---|
| Autenticação (signin/signup/forgot/reset) | ✅ | Unitário + Integração HTTP |
| Verificação de e-mail | ✅ | Unitário |
| Leads (CRUD completo + todos os campos) | ✅ | Unitário + Integração HTTP |
| Lead Sale (create/update/delete) | ✅ | Unitário + Integração HTTP |
| Produtos (CRUD completo) | ✅ | Unitário + Integração HTTP |

---

## Pendente — por prioridade

### Prioridade ALTA (lógica de negócio crítica)

#### Dashboard (`GET /dashboard/stats`)
- Arquivo a criar: `src/tests/unit/get-dashboard-stats.spec.ts`
- Arquivo a criar: `src/tests/integration/dashboard-routes.spec.ts`
- O que testar:
  - Retorna stats corretas (totalLeads, totalVendidos, conversionRate)
  - Filtra por `startDate` / `endDate`
  - Filtra por `targetUserId` (visão de cliente específico)
  - Filtra por `productId` e `categoryId`
  - Retorna 401 sem token

#### Lead Sale — listagem (`GET /lead/:leadId/sales`)
- Já tem integração HTTP. Falta unitário do use-case isolado se houver lógica separada.

---

### Prioridade MÉDIA (funcionalidades ativas em uso)

#### Templates de mensagem
- Arquivos a criar:
  - `src/tests/repositories/in-memory-message-template-repository.ts`
  - `src/tests/unit/create-template.spec.ts`
  - `src/tests/unit/list-templates.spec.ts`
  - `src/tests/integration/template-routes.spec.ts`
- Rotas: `POST /template`, `GET /template`, `PUT /template/:id`, `DELETE /template/:id`
- Dependências externas: nenhuma crítica

#### Broadcast
- Arquivos a criar:
  - `src/tests/repositories/in-memory-broadcast-repository.ts`
  - `src/tests/unit/create-broadcast.spec.ts`
  - `src/tests/unit/list-broadcasts.spec.ts`
  - `src/tests/integration/broadcast-routes.spec.ts`
- Rotas: `POST /broadcast`, `GET /broadcast`, `GET /broadcast/:id/stats`, `DELETE /broadcast/:id`
- **Atenção:** `POST /broadcast/:id/send` usa W-API — mockar `sendWhatsAppMessage`
- Dependências: mock de `@/services/wapi`

#### Usuários (rotas de admin)
- Arquivos a criar:
  - `src/tests/integration/user-admin-routes.spec.ts`
- Rotas: `POST /user/register`, `PUT /user/update`, `DELETE /user/delete/:id`, `GET /user`
- Estas rotas requerem Role ADMIN no JWT — gerar token com role ADMIN no teste

---

### Prioridade BAIXA (dependências externas pesadas)

#### Prospecção (9 rotas)
- Depende de API externa de busca de contatos
- Mockar `@/services/wapi` e repositório de prospecção
- Arquivos a criar:
  - `src/tests/repositories/in-memory-prospecting-repository.ts`
  - `src/tests/integration/prospecting-routes.spec.ts`
- Rotas: `GET /contact-list/search`, `POST /contact-list`, `GET /contact-list`, etc.

#### Automação (4 rotas)
- Depende de cron jobs e W-API
- Arquivos a criar:
  - `src/tests/repositories/in-memory-automation-repository.ts`
  - `src/tests/integration/automation-routes.spec.ts`
- Rotas: `POST /automation`, `GET /automation`, `PATCH /automation/:id/toggle`, `DELETE /automation/:id`

#### Webhook (`POST /webhook/whatsapp`)
- Payload externo do W-API — testar parsing e roteamento interno
- Arquivo a criar: `src/tests/integration/webhook-routes.spec.ts`

#### Upload (3 rotas)
- Depende de Cloudinary — já mockado em outros testes
- Arquivo a criar: `src/tests/integration/upload-routes.spec.ts`
- Rotas: `POST /upload/image`, `POST /upload/video`, `DELETE /upload`

#### Rotas públicas LP
- `POST /lp/lead` — criação de lead via landing page
- `GET /lp/products` — listagem pública de produtos
- `GET /lp/one-product` — produto único público
- Arquivo a criar: `src/tests/integration/lp-routes.spec.ts`

---

## Como implementar um novo domínio

1. Criar repositório in-memory em `src/tests/repositories/in-memory-<domain>-repository.ts`
2. Criar testes unitários em `src/tests/unit/<use-case>.spec.ts` por use-case
3. Criar teste de integração em `src/tests/integration/<domain>-routes.spec.ts`
4. Seguir o padrão de mock já estabelecido:
   ```typescript
   vi.mock('@/lib/prisma', () => ({ prisma: { ... }, CustomerType: ..., Role: ..., LeadStatus: ... }))
   vi.mock('@/lib/resend', () => ({ resend: { emails: { send: vi.fn() } } }))
   vi.mock('@/services/wapi', () => ({ sendWhatsAppMessage: vi.fn(), ... }))
   vi.mock('@/repositories/prisma/<domain>', () => ({
     Prisma<Domain>Repository: vi.fn().mockImplementation(() => repo),
   }))
   ```
5. Rodar `npm test` e corrigir antes de commitar
