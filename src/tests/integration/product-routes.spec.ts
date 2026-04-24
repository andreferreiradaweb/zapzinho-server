import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { hash } from 'bcrypt'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue({ isActive: true }),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    },
    product: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
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

vi.mock('@/services/cloudinary', () => ({
  deleteManyFromCloudinary: vi.fn().mockResolvedValue(undefined),
}))

import { InMemoryUserRepository } from '@/tests/repositories/in-memory-user-repository'
import { InMemoryProductRepository } from '@/tests/repositories/in-memory-product-repository'
import { app } from '@/app'

const userRepo = new InMemoryUserRepository()
const productRepo = new InMemoryProductRepository()

vi.mock('@/repositories/prisma/user', () => ({
  PrismaUserRepository: vi.fn().mockImplementation(() => userRepo),
}))

vi.mock('@/repositories/prisma/product', () => ({
  PrismaProductRepository: vi.fn().mockImplementation(() => productRepo),
}))

async function getAuthToken(email: string, password: string): Promise<string> {
  const response = await app.inject({
    method: 'POST',
    url: '/user/signin',
    payload: { email, password },
  })
  return response.json().token
}

describe('Rotas de produto (HTTP)', () => {
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
    productRepo.items = []
  })

  describe('POST /products', () => {
    it('retorna 201 ao criar produto válido', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/products',
        headers: { authorization: `Bearer ${token}` },
        payload: { title: 'Produto Teste', photos: [] },
      })

      expect(response.statusCode).toBe(201)
      expect(response.json().product.title).toBe('Produto Teste')
    })

    it('retorna 401 sem token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/products',
        payload: { title: 'X', photos: [] },
      })

      expect(response.statusCode).toBe(401)
    })

    it('retorna 400 para body inválido (title ausente)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/products',
        headers: { authorization: `Bearer ${token}` },
        payload: { photos: [] },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('GET /products', () => {
    it('retorna 200 e lista vazia', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/products',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json().products).toHaveLength(0)
    })

    it('retorna os produtos criados', async () => {
      await app.inject({
        method: 'POST',
        url: '/products',
        headers: { authorization: `Bearer ${token}` },
        payload: { title: 'Produto A', photos: [] },
      })
      await app.inject({
        method: 'POST',
        url: '/products',
        headers: { authorization: `Bearer ${token}` },
        payload: { title: 'Produto B', photos: [] },
      })

      const response = await app.inject({
        method: 'GET',
        url: '/products',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json().products).toHaveLength(2)
    })

    it('retorna 401 sem token', async () => {
      const response = await app.inject({ method: 'GET', url: '/products' })
      expect(response.statusCode).toBe(401)
    })
  })

  describe('GET /products-for-options', () => {
    it('retorna 200 com lista para select', async () => {
      await app.inject({
        method: 'POST',
        url: '/products',
        headers: { authorization: `Bearer ${token}` },
        payload: { title: 'Opção', photos: [] },
      })

      const response = await app.inject({
        method: 'GET',
        url: '/products-for-options',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json().products).toHaveLength(1)
    })

    it('retorna 401 sem token', async () => {
      const response = await app.inject({ method: 'GET', url: '/products-for-options' })
      expect(response.statusCode).toBe(401)
    })
  })

  describe('PUT /products', () => {
    let productId: string

    beforeEach(async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/products',
        headers: { authorization: `Bearer ${token}` },
        payload: { title: 'Original', photos: [] },
      })
      productId = res.json().product.id
    })

    it('atualiza produto com sucesso (204)', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/products',
        headers: { authorization: `Bearer ${token}` },
        payload: { id: productId, title: 'Atualizado', photos: ['foto.jpg'] },
      })

      expect(response.statusCode).toBe(204)
      const product = productRepo.items.find((p) => p.id === productId)
      expect(product?.title).toBe('Atualizado')
    })

    it('retorna 401 sem token', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/products',
        payload: { id: productId, title: 'X', photos: [] },
      })
      expect(response.statusCode).toBe(401)
    })

    it('retorna 404 para produto inexistente', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/products',
        headers: { authorization: `Bearer ${token}` },
        payload: { id: 'id-que-nao-existe', title: 'X', photos: [] },
      })
      expect(response.statusCode).toBe(404)
    })
  })

  describe('DELETE /products/:id', () => {
    it('deleta produto existente (204)', async () => {
      const create = await app.inject({
        method: 'POST',
        url: '/products',
        headers: { authorization: `Bearer ${token}` },
        payload: { title: 'Deletar', photos: [] },
      })
      const productId = create.json().product.id

      const response = await app.inject({
        method: 'DELETE',
        url: `/products/${productId}`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(204)
      expect(productRepo.items).toHaveLength(0)
    })

    it('retorna 404 ao deletar produto inexistente', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/products/id-inexistente',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(404)
    })

    it('retorna 401 sem token', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/products/qualquer-id',
      })
      expect(response.statusCode).toBe(401)
    })
  })
})
