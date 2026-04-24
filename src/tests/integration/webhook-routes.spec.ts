import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { hash } from 'bcrypt'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    prospectingBroadcast: { findFirst: vi.fn().mockResolvedValue(null) },
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

    // User WITHOUT variables configured
    await userRepo.create({
      id: 'user-no-vars',
      email: 'novars@test.com',
      passwordHash: await hash('Test123', 6),
      Role: 'CLIENT',
      CustomerType: 'B2C',
      isActive: true,
      emailVerified: true,
      wapiInstanceId: 'instance-no-vars',
      lpPhoneParam: null,
      lpNameParam: null,
    })

    // User WITH both variables configured
    await userRepo.create({
      id: 'user-with-vars',
      email: 'withvars@test.com',
      passwordHash: await hash('Test123', 6),
      Role: 'CLIENT',
      CustomerType: 'B2C',
      isActive: true,
      emailVerified: true,
      wapiInstanceId: 'instance-with-vars',
      lpPhoneParam: 'RXJS4598',
      lpNameParam: 'RXJS4599',
    })

    // User with only variable 1 configured
    await userRepo.create({
      id: 'user-one-var',
      email: 'onevar@test.com',
      passwordHash: await hash('Test123', 6),
      Role: 'CLIENT',
      CustomerType: 'B2C',
      isActive: true,
      emailVerified: true,
      wapiInstanceId: 'instance-one-var',
      lpPhoneParam: 'PHONE_CODE',
      lpNameParam: null,
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
        payload: makePayload({ instanceId: 'instance-no-vars', isGroup: true }),
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().reason).toBe('group_message_ignored')
      expect(leadRepo.items).toHaveLength(0)
    })
  })

  describe('fromMe = false (mensagem de cliente)', () => {
    it('cria lead com o telefone do remetente quando não há variáveis configuradas', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/webhook/whatsapp',
        payload: makePayload({
          instanceId: 'instance-no-vars',
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

    it('cria lead com o telefone do remetente mesmo quando variáveis estão configuradas (ignorando vars)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/webhook/whatsapp',
        payload: makePayload({
          instanceId: 'instance-with-vars',
          fromMe: false,
          chatId: '5585988880002@c.us',
          pushName: 'Cliente Qualquer',
          conversation: 'mensagem sem os códigos',
        }),
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().ok).toBe(true)
      expect(leadRepo.items).toHaveLength(1)
      expect(leadRepo.items[0].nome).toBe('Cliente Qualquer')
    })
  })

  describe('fromMe = true (mensagem própria) com variáveis configuradas', () => {
    it('cria lead com dados extraídos das variáveis no formato CODE=VALUE', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/webhook/whatsapp',
        payload: makePayload({
          instanceId: 'instance-with-vars',
          fromMe: true,
          conversation: 'Personalização escolhida: https://lp.com/?name=Teste&RXJS4598=85997139967&RXJS4599=André+Ferreira',
        }),
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().ok).toBe(true)
      expect(leadRepo.items).toHaveLength(1)
      expect(leadRepo.items[0].telefone).toBe('85997139967')
      expect(leadRepo.items[0].nome).toBe('André Ferreira')
    })

    it('cria lead com dados extraídos das variáveis no formato CODE: VALUE', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/webhook/whatsapp',
        payload: makePayload({
          instanceId: 'instance-with-vars',
          fromMe: true,
          conversation: 'Personalização escolhida: https://lp.com/?name=Teste\nRXJS4598: 85991112222\nRXJS4599: Maria Silva',
        }),
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().ok).toBe(true)
      expect(leadRepo.items).toHaveLength(1)
      expect(leadRepo.items[0].telefone).toBe('85991112222')
      expect(leadRepo.items[0].nome).toBe('Maria Silva')
    })

    it('ignora mensagem quando apenas uma das duas variáveis configuradas está presente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/webhook/whatsapp',
        payload: makePayload({
          instanceId: 'instance-with-vars',
          fromMe: true,
          conversation: 'RXJS4598=85997139967',
        }),
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().reason).toBe('vars_not_found_in_message')
      expect(leadRepo.items).toHaveLength(0)
    })

    it('ignora mensagem sem nenhuma variável quando ambas estão configuradas', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/webhook/whatsapp',
        payload: makePayload({
          instanceId: 'instance-with-vars',
          fromMe: true,
          conversation: 'mensagem normal sem códigos',
        }),
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().reason).toBe('vars_not_found_in_message')
      expect(leadRepo.items).toHaveLength(0)
    })
  })

  describe('fromMe = true com apenas uma variável configurada', () => {
    it('cria lead quando a única variável configurada está presente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/webhook/whatsapp',
        payload: makePayload({
          instanceId: 'instance-one-var',
          fromMe: true,
          conversation: 'PHONE_CODE=85933334444',
        }),
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().ok).toBe(true)
      expect(leadRepo.items).toHaveLength(1)
      expect(leadRepo.items[0].telefone).toBe('85933334444')
    })

    it('ignora mensagem quando a única variável configurada não está presente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/webhook/whatsapp',
        payload: makePayload({
          instanceId: 'instance-one-var',
          fromMe: true,
          conversation: 'mensagem sem o código',
        }),
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().reason).toBe('vars_not_found_in_message')
      expect(leadRepo.items).toHaveLength(0)
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
