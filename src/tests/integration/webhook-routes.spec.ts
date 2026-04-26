import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { hash } from 'bcrypt'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    prospectingBroadcast: { findFirst: vi.fn().mockResolvedValue(null) },
    flowSession: { findFirst: vi.fn().mockResolvedValue(null) },
    messageLog: { create: vi.fn().mockResolvedValue({}) },
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
  Prisma: { PrismaClientKnownRequestError: class {} },
}))

vi.mock('@/lib/resend', () => ({
  resend: { emails: { send: vi.fn().mockResolvedValue({}) } },
}))

vi.mock('@/services/wapi', () => ({
  sendWhatsAppMessage: vi.fn().mockResolvedValue({ success: false }),
  sendWhatsAppImage: vi.fn().mockResolvedValue({ success: false }),
  sendWhatsAppVideo: vi.fn().mockResolvedValue({ success: false }),
  sendWhatsAppMessageWithCredentials: vi.fn().mockResolvedValue({ success: false }),
  wapiDelay: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/services/lead-classification', () => ({
  addMessage: vi.fn(),
}))

vi.mock('@/repositories/prisma/prospecting', () => ({
  PrismaContactListRepository: vi.fn().mockImplementation(() => ({
    findContactByPhone: vi.fn().mockResolvedValue(null),
    updateContactStatus: vi.fn().mockResolvedValue(undefined),
  })),
}))

vi.mock('@/repositories/prisma/message-log', () => ({
  PrismaMessageLogRepository: vi.fn().mockImplementation(() => ({
    create: vi.fn().mockResolvedValue({}),
    markSent: vi.fn().mockResolvedValue({}),
    markFailed: vi.fn().mockResolvedValue({}),
  })),
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

// Helper — builds a W-API–style webhook payload
function makePayload(overrides: {
  instanceId?: string
  fromMe?: boolean
  isGroup?: boolean
  chatId?: string
  pushName?: string
  conversation?: string
}) {
  return {
    instanceId: overrides.instanceId ?? 'instance-test',
    fromMe: overrides.fromMe ?? false,
    isGroup: overrides.isGroup ?? false,
    chat: { id: overrides.chatId ?? '5585999990000@c.us' },
    sender: { pushName: overrides.pushName ?? 'Sender Name' },
    msgContent: { conversation: overrides.conversation ?? '' },
  }
}

describe('POST /webhook/whatsapp', () => {
  beforeAll(async () => {
    await app.ready()

    await userRepo.create({
      id: 'user-test',
      email: 'test@test.com',
      passwordHash: await hash('Test123', 6),
      Role: 'CLIENT',
      CustomerType: 'B2C',
      isActive: true,
      emailVerified: true,
      wapiInstanceId: 'instance-test',
    })
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    leadRepo.items = []
  })

  describe('mensagens de grupo', () => {
    it('ignora mensagens de grupo e retorna ok', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/webhook/whatsapp',
        payload: makePayload({ instanceId: 'instance-test', isGroup: true }),
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().reason).toBe('group_message_ignored')
      expect(leadRepo.items).toHaveLength(0)
    })
  })

  describe('mensagem de cliente (fromMe = false)', () => {
    it('cria lead com o telefone do remetente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/webhook/whatsapp',
        payload: makePayload({
          instanceId: 'instance-test',
          fromMe: false,
          chatId: '5585988880001@c.us',
          pushName: 'Cliente Normal',
          conversation: 'Olá, quero saber mais',
        }),
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().ok).toBe(true)
      expect(leadRepo.items).toHaveLength(1)
      expect(leadRepo.items[0].nome).toBe('Cliente Normal')
    })
  })

  describe('mensagem própria (fromMe = true)', () => {
    it('cria lead com o telefone do chat (mesmo comportamento que fromMe=false)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/webhook/whatsapp',
        payload: makePayload({
          instanceId: 'instance-test',
          fromMe: true,
          chatId: '5585977770001@c.us',
          pushName: 'Contato',
          conversation: 'mensagem enviada pelo próprio usuário',
        }),
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().ok).toBe(true)
      expect(leadRepo.items).toHaveLength(1)
      expect(leadRepo.items[0].telefone).toBe('5585977770001')
    })
  })

  describe('payload inválido', () => {
    it('retorna ok: false para payload sem instanceId', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/webhook/whatsapp',
        payload: { fromMe: false },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().ok).toBe(false)
    })
  })
})
