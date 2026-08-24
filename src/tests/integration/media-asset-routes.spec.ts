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
  deleteFromCloudinary: vi.fn().mockResolvedValue(undefined),
}))

import { InMemoryUserRepository } from '@/tests/repositories/in-memory-user-repository'
import { InMemoryMediaAssetRepository } from '@/tests/repositories/in-memory-media-asset-repository'
import { app } from '@/app'

const userRepo = new InMemoryUserRepository()
const mediaRepo = new InMemoryMediaAssetRepository()

vi.mock('@/repositories/prisma/user', () => ({
  PrismaUserRepository: vi.fn().mockImplementation(() => userRepo),
}))

vi.mock('@/repositories/prisma/media-asset', () => ({
  PrismaMediaAssetRepository: vi.fn().mockImplementation(() => mediaRepo),
}))

async function getAuthToken(email: string, password: string): Promise<string> {
  const response = await app.inject({
    method: 'POST',
    url: '/user/signin',
    payload: { email, password },
  })
  return response.json().token
}

describe('Rotas de mídia (HTTP)', () => {
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
    mediaRepo.items = []
  })

  describe('POST /media-assets', () => {
    it('retorna 201 ao criar mídia válida', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/media-assets',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          type: 'IMAGE',
          url: 'https://cdn.test/foto.jpg',
          title: 'Foto da loja',
          description: 'Foto da fachada',
        },
      })

      expect(response.statusCode).toBe(201)
      expect(response.json().mediaAsset.title).toBe('Foto da loja')
    })

    it('retorna 401 sem token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/media-assets',
        payload: { type: 'IMAGE', url: 'https://cdn.test/foto.jpg', title: 'X' },
      })

      expect(response.statusCode).toBe(401)
    })

    it('retorna 400 para type inválido', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/media-assets',
        headers: { authorization: `Bearer ${token}` },
        payload: { type: 'PDF', url: 'https://cdn.test/foto.jpg', title: 'X' },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('GET /media-assets', () => {
    it('retorna as mídias do usuário', async () => {
      await app.inject({
        method: 'POST',
        url: '/media-assets',
        headers: { authorization: `Bearer ${token}` },
        payload: { type: 'VIDEO', url: 'https://cdn.test/video.mp4', title: 'Vídeo' },
      })

      const response = await app.inject({
        method: 'GET',
        url: '/media-assets',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json().mediaAssets).toHaveLength(1)
    })
  })

  describe('DELETE /media-assets/:id', () => {
    it('deleta mídia existente (204)', async () => {
      const create = await app.inject({
        method: 'POST',
        url: '/media-assets',
        headers: { authorization: `Bearer ${token}` },
        payload: { type: 'AUDIO', url: 'https://cdn.test/audio.mp3', title: 'Áudio' },
      })
      const mediaId = create.json().mediaAsset.id

      const response = await app.inject({
        method: 'DELETE',
        url: `/media-assets/${mediaId}`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(204)
      expect(mediaRepo.items).toHaveLength(0)
    })

    it('retorna 404 ao deletar mídia inexistente', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/media-assets/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(404)
    })
  })
})
