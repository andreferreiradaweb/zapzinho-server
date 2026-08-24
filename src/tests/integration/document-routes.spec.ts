import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { hash } from 'bcrypt'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn().mockResolvedValue({ isActive: true }) },
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

vi.mock('@/services/cloudinary', () => ({
  uploadToCloudinary: vi.fn().mockResolvedValue('https://cdn.test/doc.pdf'),
  deleteFromCloudinary: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/services/pdf', () => ({
  extractPdfText: vi.fn().mockResolvedValue('Texto extraído do PDF de teste.'),
}))

const fetchMock = vi.fn().mockResolvedValue({
  ok: true,
  arrayBuffer: async () => new ArrayBuffer(8),
})
vi.stubGlobal('fetch', fetchMock)

import { InMemoryUserRepository } from '@/tests/repositories/in-memory-user-repository'
import { InMemoryDocumentRepository } from '@/tests/repositories/in-memory-document-repository'
import { app } from '@/app'

const userRepo = new InMemoryUserRepository()
const documentRepo = new InMemoryDocumentRepository()

vi.mock('@/repositories/prisma/user', () => ({
  PrismaUserRepository: vi.fn().mockImplementation(() => userRepo),
}))

vi.mock('@/repositories/prisma/document', () => ({
  PrismaDocumentRepository: vi.fn().mockImplementation(() => documentRepo),
}))

async function getAuthToken(email: string, password: string): Promise<string> {
  const response = await app.inject({
    method: 'POST',
    url: '/user/signin',
    payload: { email, password },
  })
  return response.json().token
}

describe('Rotas de documento (HTTP)', () => {
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
    documentRepo.items = []
  })

  describe('POST /documents/text', () => {
    it('retorna 201 ao criar documento de texto válido', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/documents/text',
        headers: { authorization: `Bearer ${token}` },
        payload: { title: 'Política de troca', content: 'Trocas em até 7 dias.' },
      })

      expect(response.statusCode).toBe(201)
      expect(response.json().document.status).toBe('PROCESSED')
    })

    it('retorna 401 sem token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/documents/text',
        payload: { title: 'X', content: 'Y' },
      })

      expect(response.statusCode).toBe(401)
    })

    it('retorna 400 para body inválido (content ausente)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/documents/text',
        headers: { authorization: `Bearer ${token}` },
        payload: { title: 'X' },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('POST /documents/pdf', () => {
    it('retorna 201 e processa o texto extraído', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/documents/pdf',
        headers: { authorization: `Bearer ${token}` },
        payload: { title: 'Catálogo', fileUrl: 'https://cdn.test/doc.pdf' },
      })

      expect(response.statusCode).toBe(201)
      expect(response.json().document.status).toBe('PROCESSED')
      expect(response.json().document.content).toBe('Texto extraído do PDF de teste.')
    })
  })

  describe('GET /documents', () => {
    it('retorna os documentos do usuário', async () => {
      await app.inject({
        method: 'POST',
        url: '/documents/text',
        headers: { authorization: `Bearer ${token}` },
        payload: { title: 'Doc A', content: 'Conteúdo A' },
      })

      const response = await app.inject({
        method: 'GET',
        url: '/documents',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json().documents).toHaveLength(1)
    })

    it('retorna 401 sem token', async () => {
      const response = await app.inject({ method: 'GET', url: '/documents' })
      expect(response.statusCode).toBe(401)
    })
  })

  describe('DELETE /documents/:id', () => {
    it('deleta documento existente (204)', async () => {
      const create = await app.inject({
        method: 'POST',
        url: '/documents/text',
        headers: { authorization: `Bearer ${token}` },
        payload: { title: 'Deletar', content: 'X' },
      })
      const documentId = create.json().document.id

      const response = await app.inject({
        method: 'DELETE',
        url: `/documents/${documentId}`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(204)
      expect(documentRepo.items).toHaveLength(0)
    })

    it('retorna 404 ao deletar documento inexistente', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/documents/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(404)
    })
  })
})
