import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { hash } from 'bcrypt'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue({ isActive: true }),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    },
    messageLog: { create: vi.fn().mockResolvedValue({}) },
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
  FlowActionType: {
    SEND_MESSAGE: 'SEND_MESSAGE',
    UPDATE_LEAD_STATUS: 'UPDATE_LEAD_STATUS',
    ASSIGN_CATEGORY: 'ASSIGN_CATEGORY',
  },
  FlowSessionStatus: {
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    EXPIRED: 'EXPIRED',
  },
}))

vi.mock('@/lib/resend', () => ({
  resend: { emails: { send: vi.fn().mockResolvedValue({}) } },
}))

vi.mock('@/services/wapi', () => ({
  sendWhatsAppMessage: vi.fn().mockResolvedValue({ success: true }),
  sendWhatsAppImage: vi.fn().mockResolvedValue({ success: true }),
  sendWhatsAppVideo: vi.fn().mockResolvedValue({ success: true }),
  wapiDelay: vi.fn().mockResolvedValue(undefined),
}))

import { InMemoryUserRepository } from '@/tests/repositories/in-memory-user-repository'
import { InMemoryLeadRepository } from '@/tests/repositories/in-memory-lead-repository'
import { InMemoryFlowRepository } from '@/tests/repositories/in-memory-flow-repository'
import { app } from '@/app'

const userRepo = new InMemoryUserRepository()
const leadRepo = new InMemoryLeadRepository()
const flowRepo = new InMemoryFlowRepository()

vi.mock('@/repositories/prisma/user', () => ({
  PrismaUserRepository: vi.fn().mockImplementation(() => userRepo),
}))

vi.mock('@/repositories/prisma/lead', () => ({
  PrismaLeadRepository: vi.fn().mockImplementation(() => leadRepo),
}))

vi.mock('@/repositories/prisma/flow', () => ({
  PrismaFlowRepository: vi.fn().mockImplementation(() => flowRepo),
}))

vi.mock('@/repositories/prisma/message-log', () => ({
  PrismaMessageLogRepository: vi.fn().mockImplementation(() => ({
    create: vi.fn().mockResolvedValue({}),
  })),
}))

const STEP_PAYLOAD = {
  message: 'Olá! Como posso ajudar?\n1. Financeiro\n2. Suporte',
  options: [
    {
      label: '1. Financeiro',
      trigger: '1',
      actions: [{ type: 'SEND_MESSAGE', payload: { message: 'Setor financeiro.' }, order: 0 }],
    },
    {
      label: '2. Suporte',
      trigger: '2',
      actions: [
        { type: 'SEND_MESSAGE', payload: { message: 'Setor de suporte.' }, order: 0 },
        { type: 'UPDATE_LEAD_STATUS', payload: { status: 'NEGOCIACAO' }, order: 1 },
      ],
    },
  ],
}

async function getAuthToken(email: string, password: string): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/user/signin',
    payload: { email, password },
  })
  return res.json().token
}

describe('Rotas de flows (HTTP)', () => {
  let token: string

  beforeAll(async () => {
    await app.ready()
    await userRepo.create({
      id: 'user-flows-1',
      email: 'flows@empresa.com',
      passwordHash: await hash('Senha123', 6),
      Role: 'CLIENT',
      CustomerType: 'B2C',
      isActive: true,
      emailVerified: true,
    })
    token = await getAuthToken('flows@empresa.com', 'Senha123')
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    flowRepo.items = []
    flowRepo.sessions = []
    leadRepo.items = []
  })

  describe('POST /flows', () => {
    it('retorna 201 ao criar flow válido', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/flows',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Atendimento', step: STEP_PAYLOAD },
      })

      expect(res.statusCode).toBe(201)
      const body = res.json()
      expect(body.name).toBe('Atendimento')
      expect(body.isActive).toBe(true)
      expect(body.Steps).toHaveLength(1)
      expect(body.Steps[0].Options).toHaveLength(2)
    })

    it('persiste o flow no repositório', async () => {
      await app.inject({
        method: 'POST',
        url: '/flows',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Teste persist', step: STEP_PAYLOAD },
      })

      expect(flowRepo.items).toHaveLength(1)
      expect(flowRepo.items[0].name).toBe('Teste persist')
    })

    it('persiste opções e ações corretamente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/flows',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Fluxo ações', step: STEP_PAYLOAD },
      })

      const flow = flowRepo.items.find((f) => f.id === res.json().id)
      const opts = flow!.Steps[0].Options
      expect(opts[0].trigger).toBe('1')
      expect(opts[0].Actions[0].type).toBe('SEND_MESSAGE')
      expect(opts[1].Actions).toHaveLength(2)
      expect(opts[1].Actions[1].type).toBe('UPDATE_LEAD_STATUS')
    })

    it('retorna 400 para step sem opções', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/flows',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Sem opções', step: { message: 'Olá', options: [] } },
      })
      expect(res.statusCode).toBe(400)
    })

    it('retorna 401 sem token', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/flows',
        payload: { name: 'Sem auth', step: STEP_PAYLOAD },
      })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('GET /flows', () => {
    it('retorna 200 e lista de flows do usuário', async () => {
      await app.inject({
        method: 'POST',
        url: '/flows',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Flow A', step: STEP_PAYLOAD },
      })
      await app.inject({
        method: 'POST',
        url: '/flows',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Flow B', step: STEP_PAYLOAD },
      })

      const res = await app.inject({
        method: 'GET',
        url: '/flows',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toHaveLength(2)
    })

    it('retorna 401 sem token', async () => {
      const res = await app.inject({ method: 'GET', url: '/flows' })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('PUT /flows/:id', () => {
    let flowId: string

    beforeEach(async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/flows',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Original', step: STEP_PAYLOAD },
      })
      flowId = res.json().id
    })

    it('atualiza nome e isActive (200)', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: `/flows/${flowId}`,
        headers: { authorization: `Bearer ${token}` },
        payload: {
          name: 'Atualizado',
          isActive: false,
          step: STEP_PAYLOAD,
        },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().name).toBe('Atualizado')
      expect(res.json().isActive).toBe(false)
    })

    it('atualiza opções e ações do step', async () => {
      const newStep = {
        message: 'Nova mensagem',
        options: [
          {
            label: '1. Novo',
            trigger: '1',
            actions: [{ type: 'SEND_MESSAGE', payload: { message: 'Ok' }, order: 0 }],
          },
        ],
      }

      const res = await app.inject({
        method: 'PUT',
        url: `/flows/${flowId}`,
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Atualizado', isActive: true, step: newStep },
      })

      expect(res.statusCode).toBe(200)
      const flow = flowRepo.items.find((f) => f.id === flowId)
      expect(flow!.Steps[0].message).toBe('Nova mensagem')
      expect(flow!.Steps[0].Options).toHaveLength(1)
    })

    it('retorna 404 para flow inexistente', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/flows/00000000-0000-0000-0000-000000000099',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'X', isActive: true, step: STEP_PAYLOAD },
      })
      expect(res.statusCode).toBe(404)
    })

    it('retorna 401 sem token', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: `/flows/${flowId}`,
        payload: { name: 'X', isActive: true, step: STEP_PAYLOAD },
      })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('DELETE /flows/:id', () => {
    let flowId: string

    beforeEach(async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/flows',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Para deletar', step: STEP_PAYLOAD },
      })
      flowId = res.json().id
    })

    it('deleta flow com sucesso (204)', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/flows/${flowId}`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(204)
      expect(flowRepo.items).toHaveLength(0)
    })

    it('retorna 404 para flow inexistente', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/flows/00000000-0000-0000-0000-000000000099',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(res.statusCode).toBe(404)
    })

    it('retorna 401 sem token', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/flows/${flowId}`,
      })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('POST /flows/:flowId/trigger/:leadId', () => {
    let flowId: string
    let leadId: string

    beforeEach(async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/flows',
        headers: { authorization: `Bearer ${token}` },
        payload: { name: 'Trigger test', step: STEP_PAYLOAD },
      })
      flowId = res.json().id

      const lead = await leadRepo.create({
        nome: 'Lead Teste',
        telefone: '5511999990001',
        message: 'oi',
        Status: 'NEGOCIACAO',
        userId: 'user-flows-1',
      })
      leadId = lead.id
    })

    it('retorna 200 e sessionId ao disparar flow', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/flows/${flowId}/trigger/${leadId}`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().sessionId).toBeDefined()
    })

    it('cria sessão ativa após trigger', async () => {
      await app.inject({
        method: 'POST',
        url: `/flows/${flowId}/trigger/${leadId}`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(flowRepo.sessions).toHaveLength(1)
      expect(flowRepo.sessions[0].status).toBe('ACTIVE')
      expect(flowRepo.sessions[0].phone).toBe('5511999990001')
    })

    it('retorna 404 para flow inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/flows/00000000-0000-0000-0000-000000000099/trigger/${leadId}`,
        headers: { authorization: `Bearer ${token}` },
      })
      expect(res.statusCode).toBe(404)
    })

    it('retorna 404 para lead inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/flows/${flowId}/trigger/00000000-0000-0000-0000-000000000099`,
        headers: { authorization: `Bearer ${token}` },
      })
      expect(res.statusCode).toBe(404)
    })

    it('retorna 401 sem token', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/flows/${flowId}/trigger/${leadId}`,
      })
      expect(res.statusCode).toBe(401)
    })
  })
})
