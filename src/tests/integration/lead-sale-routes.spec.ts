import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { hash } from 'bcrypt'

const PROD_1 = 'e4b8d7a2-0000-0000-0000-000000000001'
const PROD_2 = 'e4b8d7a2-0000-0000-0000-000000000002'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue({ isActive: true }),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    },
    product: {
      findMany: vi.fn().mockResolvedValue([
        { id: 'e4b8d7a2-0000-0000-0000-000000000001', price: '100,00' },
        { id: 'e4b8d7a2-0000-0000-0000-000000000002', price: '50,00' },
      ]),
      count: vi.fn().mockResolvedValue(0),
    },
    messageLog: { create: vi.fn().mockResolvedValue({}) },
    lead: { update: vi.fn().mockResolvedValue({}) },
    broadcast: { findUnique: vi.fn() },
  },
  CustomerType: { B2C: 'B2C', B2B: 'B2B' },
  Role: { ADMIN: 'ADMIN', CLIENT: 'CLIENT' },
  LeadStatus: {
    NOVO_INTERESSE: 'NOVO_INTERESSE',
    CONTATO_FEITO: 'CONTATO_FEITO',
    NEGOCIACAO: 'NEGOCIACAO',
    VENDIDO: 'VENDIDO',
    NAO_INTERESSADO: 'NAO_INTERESSADO',
  },
}))

vi.mock('@/lib/resend', () => ({
  resend: { emails: { send: vi.fn().mockResolvedValue({}) } },
}))

vi.mock('@/services/wapi', () => ({
  sendWhatsAppMessage: vi.fn().mockResolvedValue({ success: false }),
  sendWhatsAppImage: vi.fn().mockResolvedValue({ success: false }),
  sendWhatsAppVideo: vi.fn().mockResolvedValue({ success: false }),
  wapiDelay: vi.fn().mockResolvedValue(undefined),
}))

import { InMemoryUserRepository } from '@/tests/repositories/in-memory-user-repository'
import { InMemoryLeadRepository } from '@/tests/repositories/in-memory-lead-repository'
import { InMemoryLeadSaleRepository } from '@/tests/repositories/in-memory-lead-sale-repository'
import { app } from '@/app'

const userRepo = new InMemoryUserRepository()
const leadRepo = new InMemoryLeadRepository()
const saleRepo = new InMemoryLeadSaleRepository()

vi.mock('@/repositories/prisma/user', () => ({
  PrismaUserRepository: vi.fn().mockImplementation(() => userRepo),
}))

vi.mock('@/repositories/prisma/lead', () => ({
  PrismaLeadRepository: vi.fn().mockImplementation(() => leadRepo),
}))

vi.mock('@/repositories/prisma/lead-sale', () => ({
  PrismaLeadSaleRepository: vi.fn().mockImplementation(() => saleRepo),
}))

async function getAuthToken(email: string, password: string): Promise<string> {
  const response = await app.inject({
    method: 'POST',
    url: '/user/signin',
    payload: { email, password },
  })
  return response.json().token
}

describe('Rotas de lead-sale (HTTP)', () => {
  let token: string
  let leadId: string

  beforeAll(async () => {
    await app.ready()

    await userRepo.create({
      id: 'owner-1',
      email: 'dono@empresa.com',
      passwordHash: await hash('Empresa123', 6),
      Role: 'CLIENT',
      CustomerType: 'B2C',
      isActive: true,
      emailVerified: true,
    })

    token = await getAuthToken('dono@empresa.com', 'Empresa123')
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    leadRepo.items = []
    saleRepo.items = []

    const lead = await leadRepo.create({
      nome: 'Lead Venda',
      telefone: '11999990000',
      message: 'interesse',
      Status: 'NEGOCIACAO',
      userId: 'owner-1',
    })
    leadId = lead.id
  })

  describe('POST /lead-sale', () => {
    it('retorna 201 ao registrar venda válida', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/lead-sale',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          leadId,
          discount: 0,
          items: [{ productId: PROD_1, quantity: 1 }],
        },
      })

      expect(response.statusCode).toBe(201)
      expect(response.json().leadId).toBe(leadId)
    })

    it('move lead para VENDIDO após registrar venda', async () => {
      await app.inject({
        method: 'POST',
        url: '/lead-sale',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          leadId,
          discount: 0,
          items: [{ productId: PROD_1, quantity: 1 }],
        },
      })

      const lead = leadRepo.items.find((l) => l.id === leadId)
      expect(lead?.Status).toBe('VENDIDO')
    })

    it('retorna 401 sem token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/lead-sale',
        payload: { leadId, discount: 0, items: [{ productId: PROD_1, quantity: 1 }] },
      })
      expect(response.statusCode).toBe(401)
    })

    it('retorna 400 para items vazio', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/lead-sale',
        headers: { authorization: `Bearer ${token}` },
        payload: { leadId, discount: 0, items: [] },
      })
      expect(response.statusCode).toBe(400)
    })

    it('retorna 404 para lead inexistente', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/lead-sale',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          leadId: '00000000-0000-0000-0000-000000000001',
          discount: 0,
          items: [{ productId: PROD_1, quantity: 1 }],
        },
      })
      expect(response.statusCode).toBe(404)
    })

    it('grava costPrice por item quando enviado no payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/lead-sale',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          leadId,
          discount: 0,
          items: [{ productId: PROD_1, quantity: 1, costPrice: 60 }],
        },
      })

      expect(response.statusCode).toBe(201)
      const sale = saleRepo.items.find((s) => s.id === response.json().id)
      expect(sale?.Items[0].costPrice).toBe(60)
    })

    it('grava costPrice null quando não enviado no payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/lead-sale',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          leadId,
          discount: 0,
          items: [{ productId: PROD_1, quantity: 1 }],
        },
      })

      expect(response.statusCode).toBe(201)
      const sale = saleRepo.items.find((s) => s.id === response.json().id)
      expect(sale?.Items[0].costPrice).toBeNull()
    })
  })

  describe('PUT /lead-sale/:saleId', () => {
    let saleId: string

    beforeEach(async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/lead-sale',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          leadId,
          discount: 0,
          items: [{ productId: PROD_1, quantity: 1 }],
        },
      })
      saleId = res.json().id
    })

    it('atualiza venda com sucesso (200)', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/lead-sale/${saleId}`,
        headers: { authorization: `Bearer ${token}` },
        payload: {
          discount: 15,
          items: [{ productId: PROD_2, quantity: 2 }],
        },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json().discount).toBe(15)
    })

    it('retorna 401 sem token', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/lead-sale/${saleId}`,
        payload: { discount: 0, items: [{ productId: PROD_1, quantity: 1 }] },
      })
      expect(response.statusCode).toBe(401)
    })

    it('atualiza costPrice por item quando enviado no payload', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/lead-sale/${saleId}`,
        headers: { authorization: `Bearer ${token}` },
        payload: {
          discount: 0,
          items: [{ productId: PROD_2, quantity: 1, costPrice: 35 }],
        },
      })

      expect(response.statusCode).toBe(200)
      const sale = saleRepo.items.find((s) => s.id === saleId)
      expect(sale?.Items[0].costPrice).toBe(35)
    })

    it('retorna 404 para venda inexistente', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/lead-sale/00000000-0000-0000-0000-000000000099',
        headers: { authorization: `Bearer ${token}` },
        payload: { discount: 0, items: [{ productId: PROD_1, quantity: 1 }] },
      })
      expect(response.statusCode).toBe(404)
    })
  })

  describe('DELETE /lead-sale/:saleId', () => {
    let saleId: string

    beforeEach(async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/lead-sale',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          leadId,
          discount: 0,
          items: [{ productId: PROD_1, quantity: 1 }],
        },
      })
      saleId = res.json().id
    })

    it('deleta venda com sucesso (204)', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/lead-sale/${saleId}`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(204)
      expect(saleRepo.items).toHaveLength(0)
    })

    it('reverte lead para NEGOCIACAO após deletar única venda', async () => {
      await app.inject({
        method: 'DELETE',
        url: `/lead-sale/${saleId}`,
        headers: { authorization: `Bearer ${token}` },
      })

      const lead = leadRepo.items.find((l) => l.id === leadId)
      expect(lead?.Status).toBe('NEGOCIACAO')
    })

    it('retorna 401 sem token', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/lead-sale/${saleId}`,
      })
      expect(response.statusCode).toBe(401)
    })

    it('retorna 404 para venda inexistente', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/lead-sale/00000000-0000-0000-0000-000000000099',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode).toBe(404)
    })
  })

  describe('GET /lead/:leadId/sales', () => {
    it('retorna 200 e lista de vendas do lead', async () => {
      await app.inject({
        method: 'POST',
        url: '/lead-sale',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          leadId,
          discount: 0,
          items: [{ productId: PROD_1, quantity: 1 }],
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: `/lead/${leadId}/sales`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toHaveLength(1)
    })

    it('retorna 401 sem token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/lead/${leadId}/sales`,
      })
      expect(response.statusCode).toBe(401)
    })

    it('retorna 404 para lead inexistente', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/lead/00000000-0000-0000-0000-000000000001/sales',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode).toBe(404)
    })
  })
})
