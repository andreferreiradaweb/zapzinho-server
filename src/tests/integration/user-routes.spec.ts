import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { hash } from 'bcrypt'

// Mocks must be declared before app import
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    },
    messageLog: { create: vi.fn().mockResolvedValue({}) },
  },
  CustomerType: { B2C: 'B2C', B2B: 'B2B' },
  Role: { ADMIN: 'ADMIN', CLIENT: 'CLIENT' },
  UserPlan: { PADRAO: 'PADRAO' },
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
import { app } from '@/app'

const userRepo = new InMemoryUserRepository()

vi.mock('@/repositories/prisma/user', () => ({
  PrismaUserRepository: vi.fn().mockImplementation(() => userRepo),
}))

describe('Rotas de usuário (HTTP)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    userRepo.items = []
    vi.clearAllMocks()
  })

  describe('POST /user/signin', () => {
    it('retorna 200 e token com credenciais válidas', async () => {
      await userRepo.create({
        id: 'u-1',
        email: 'cliente@email.com',
        passwordHash: await hash('Senha123', 6),
        Role: 'CLIENT',
        CustomerType: 'B2C',
        isActive: true,
        emailVerified: true,
      })

      const response = await app.inject({
        method: 'POST',
        url: '/user/signin',
        payload: { email: 'cliente@email.com', password: 'Senha123' },
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body).toHaveProperty('token')
    })

    it('retorna 401 para senha incorreta', async () => {
      await userRepo.create({
        id: 'u-2',
        email: 'cliente2@email.com',
        passwordHash: await hash('Senha123', 6),
        Role: 'CLIENT',
        CustomerType: 'B2C',
        isActive: true,
        emailVerified: true,
      })

      const response = await app.inject({
        method: 'POST',
        url: '/user/signin',
        payload: { email: 'cliente2@email.com', password: 'SenhaErrada1' },
      })

      expect(response.statusCode).toBe(401)
    })

    it('retorna 403 quando e-mail não foi verificado', async () => {
      await userRepo.create({
        id: 'u-3',
        email: 'noverify@email.com',
        passwordHash: await hash('Senha123', 6),
        Role: 'CLIENT',
        CustomerType: 'B2C',
        isActive: true,
        emailVerified: false,
      })

      const response = await app.inject({
        method: 'POST',
        url: '/user/signin',
        payload: { email: 'noverify@email.com', password: 'Senha123' },
      })

      expect(response.statusCode).toBe(403)
      expect(response.json()).toHaveProperty('emailNotVerified', true)
    })

    it('retorna 400 para body inválido (senha curta)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/user/signin',
        payload: { email: 'teste@email.com', password: '123' },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('POST /user/signup', () => {
    it('retorna 201 ao cadastrar novo usuário', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/user/signup',
        payload: {
          email: 'novo@email.com',
          password: 'Senha123',
          name: 'João',
        },
      })

      expect(response.statusCode).toBe(201)
    })

    it('retorna 400 para senha sem letras maiúsculas', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/user/signup',
        payload: { email: 'novo@email.com', password: 'senha123' },
      })

      expect(response.statusCode).toBe(400)
    })

    it('retorna 400 para e-mail inválido', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/user/signup',
        payload: { email: 'naoemail', password: 'Senha123' },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('POST /user/forgot-password', () => {
    it('retorna 200 para e-mail cadastrado', async () => {
      await userRepo.create({
        id: 'u-4',
        email: 'recuperar@email.com',
        passwordHash: await hash('Senha123', 6),
        Role: 'CLIENT',
        CustomerType: 'B2C',
        isActive: true,
        emailVerified: true,
      })

      const response = await app.inject({
        method: 'POST',
        url: '/user/forgot-password',
        payload: { email: 'recuperar@email.com' },
      })

      expect(response.statusCode).toBe(200)
    })

    it('retorna 404 para e-mail não cadastrado', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/user/forgot-password',
        payload: { email: 'naoexiste@email.com' },
      })

      expect(response.statusCode).toBe(404)
    })
  })

  describe('GET /user/:id (rota protegida)', () => {
    it('retorna 401 sem token JWT', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/user/qualquer-id',
      })

      expect(response.statusCode).toBe(401)
    })
  })
})
