import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { hash } from 'bcrypt'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
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
import { app } from '@/app'

const userRepo = new InMemoryUserRepository()
const leadRepo = new InMemoryLeadRepository()

vi.mock('@/repositories/prisma/user', () => ({
  PrismaUserRepository: vi.fn().mockImplementation(() => userRepo),
}))

vi.mock('@/repositories/prisma/lead', () => ({
  PrismaLeadRepository: vi.fn().mockImplementation(() => leadRepo),
}))

async function getAuthToken(email: string, password: string): Promise<string> {
  const response = await app.inject({
    method: 'POST',
    url: '/user/signin',
    payload: { email, password },
  })
  return response.json().token
}

describe('Rotas de lead (HTTP)', () => {
  let token: string

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

  beforeEach(() => {
    leadRepo.items = []
  })

  describe('POST /lead', () => {
    it('retorna 201 ao criar lead válido', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/lead',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          nome: 'Maria Silva',
          telefone: '11999990000',
          message: 'Interesse no produto',
          Status: 'NOVO_INTERESSE',
        },
      })

      expect(response.statusCode).toBe(201)
      expect(response.json().lead.nome).toBe('Maria Silva')
    })

    it('retorna 401 sem token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/lead',
        payload: { nome: 'Teste', telefone: '11999990001', message: 'msg', Status: 'NOVO_INTERESSE' },
      })

      expect(response.statusCode).toBe(401)
    })

    it('retorna 400 para body inválido (nome ausente)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/lead',
        headers: { authorization: `Bearer ${token}` },
        payload: { telefone: '11999990002', message: 'msg', Status: 'NOVO_INTERESSE' },
      })

      expect(response.statusCode).toBe(400)
    })

    it('retorna 409 ao tentar criar lead com telefone duplicado', async () => {
      await app.inject({
        method: 'POST',
        url: '/lead',
        headers: { authorization: `Bearer ${token}` },
        payload: { nome: 'João', telefone: '11988880000', message: 'primeiro', Status: 'NOVO_INTERESSE' },
      })

      const response = await app.inject({
        method: 'POST',
        url: '/lead',
        headers: { authorization: `Bearer ${token}` },
        payload: { nome: 'João Duplicado', telefone: '11988880000', message: 'duplicado', Status: 'NOVO_INTERESSE' },
      })

      expect(response.statusCode).toBe(409)
    })
  })

  describe('GET /lead', () => {
    it('retorna 200 e lista vazia inicialmente', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/lead',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(200)
    })

    it('retorna 401 sem token', async () => {
      const response = await app.inject({ method: 'GET', url: '/lead' })
      expect(response.statusCode).toBe(401)
    })
  })

  describe('PUT /lead', () => {
    let existingLeadId: string

    beforeEach(async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/lead',
        headers: { authorization: `Bearer ${token}` },
        payload: { nome: 'Lead Edição', telefone: '11955550000', message: 'msg', Status: 'NOVO_INTERESSE' },
      })
      existingLeadId = res.json().lead.id
    })

    it('atualiza o nome com sucesso (204)', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/lead',
        headers: { authorization: `Bearer ${token}` },
        payload: { id: existingLeadId, Status: 'NOVO_INTERESSE', nome: 'Nome Atualizado', telefone: '11955550000' },
      })
      expect(response.statusCode).toBe(204)
    })

    it('atualiza sellerNote em lead VENDIDO sem bloquear (backend não tem restrição)', async () => {
      // Move o lead para VENDIDO primeiro
      await app.inject({
        method: 'PUT',
        url: '/lead',
        headers: { authorization: `Bearer ${token}` },
        payload: { id: existingLeadId, Status: 'VENDIDO', nome: 'Lead Edição', telefone: '11955550000' },
      })

      // Deve conseguir atualizar sellerNote no lead VENDIDO
      const response = await app.inject({
        method: 'PUT',
        url: '/lead',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          id: existingLeadId,
          Status: 'VENDIDO',
          nome: 'Lead Edição',
          telefone: '11955550000',
          sellerNote: 'Comentário após venda',
        },
      })
      expect(response.statusCode).toBe(204)
    })

    it('move lead por todas as etapas: NOVO_INTERESSE → CONTATO_FEITO → NEGOCIACAO → VENDIDO', async () => {
      for (const status of ['CONTATO_FEITO', 'NEGOCIACAO', 'VENDIDO']) {
        const response = await app.inject({
          method: 'PUT',
          url: '/lead',
          headers: { authorization: `Bearer ${token}` },
          payload: { id: existingLeadId, Status: status, nome: 'Lead Edição', telefone: '11955550000' },
        })
        expect(response.statusCode).toBe(204)
        const lead = leadRepo.items.find((l) => l.id === existingLeadId)
        expect(lead?.Status).toBe(status)
      }
    })

    it('vincula produto de interesse (productId)', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/lead',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          id: existingLeadId,
          Status: 'NOVO_INTERESSE',
          nome: 'Lead Edição',
          telefone: '11955550000',
          productId: 'e4b8d7a2-1234-5678-abcd-000000000001',
        },
      })
      expect(response.statusCode).toBe(204)
    })

    it('vincula categoria (categoryId)', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/lead',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          id: existingLeadId,
          Status: 'NOVO_INTERESSE',
          nome: 'Lead Edição',
          telefone: '11955550000',
          categoryId: 'e4b8d7a2-1234-5678-abcd-000000000002',
        },
      })
      expect(response.statusCode).toBe(204)
    })

    it('registra data de entrega', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/lead',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          id: existingLeadId,
          Status: 'NOVO_INTERESSE',
          nome: 'Lead Edição',
          telefone: '11955550000',
          deliveryDate: '2026-12-31T00:00:00.000Z',
        },
      })
      expect(response.statusCode).toBe(204)
    })

    it('retorna 401 sem token', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/lead',
        payload: { id: existingLeadId, Status: 'NOVO_INTERESSE', nome: 'x', telefone: '11955550000' },
      })
      expect(response.statusCode).toBe(401)
    })

    it('retorna 400 para Status inválido', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/lead',
        headers: { authorization: `Bearer ${token}` },
        payload: { id: existingLeadId, Status: 'STATUS_INVALIDO', nome: 'x', telefone: '11955550000' },
      })
      expect(response.statusCode).toBe(400)
    })

    it('retorna 404 para lead que não existe', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/lead',
        headers: { authorization: `Bearer ${token}` },
        payload: { id: 'id-que-nao-existe', Status: 'NOVO_INTERESSE', nome: 'x', telefone: '11955550000' },
      })
      expect(response.statusCode).toBe(404)
    })
  })

  describe('DELETE /lead/:id', () => {
    it('retorna 404 ao deletar lead inexistente', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/lead/id-inexistente',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(404)
    })

    it('deleta lead existente com sucesso', async () => {
      const create = await app.inject({
        method: 'POST',
        url: '/lead',
        headers: { authorization: `Bearer ${token}` },
        payload: { nome: 'Deletar', telefone: '11977770000', message: 'del', Status: 'NOVO_INTERESSE' },
      })

      const leadId = create.json().lead.id

      const response = await app.inject({
        method: 'DELETE',
        url: `/lead/${leadId}`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect([200, 204]).toContain(response.statusCode)
      expect(leadRepo.items).toHaveLength(0)
    })
  })
})
