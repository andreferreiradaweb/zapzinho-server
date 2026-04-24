import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateProductUseCase } from '@/use-cases/product/create-product'
import { UserNotFound } from '@/error/user-not-found'
import { InMemoryUserRepository } from '@/tests/repositories/in-memory-user-repository'
import { InMemoryProductRepository } from '@/tests/repositories/in-memory-product-repository'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn().mockResolvedValue({ isActive: true }) },
    product: { count: vi.fn().mockResolvedValue(0) },
  },
}))

const OWNER_ID = 'owner-1'

describe('CreateProductUseCase', () => {
  let userRepo: InMemoryUserRepository
  let productRepo: InMemoryProductRepository
  let sut: CreateProductUseCase

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository()
    productRepo = new InMemoryProductRepository()
    sut = new CreateProductUseCase(productRepo, userRepo)

    await userRepo.create({
      id: OWNER_ID,
      email: 'dono@empresa.com',
      passwordHash: 'hash',
      Role: 'CLIENT',
      CustomerType: 'B2C',
      isActive: true,
      emailVerified: true,
    })
  })

  it('cria produto com sucesso', async () => {
    const { product } = await sut.execute({
      title: 'Produto Teste',
      photos: [],
      userId: OWNER_ID,
    })

    expect(product.title).toBe('Produto Teste')
    expect(product.userId).toBe(OWNER_ID)
    expect(productRepo.items).toHaveLength(1)
  })

  it('persiste todos os campos opcionais', async () => {
    const { product } = await sut.execute({
      title: 'Completo',
      description: 'Desc',
      code: 'SKU-001',
      price: '99,90',
      costPrice: '50,00',
      condition: 'novo',
      photos: ['url1', 'url2'],
      userId: OWNER_ID,
      categoryId: 'cat-1',
    })

    expect(product.description).toBe('Desc')
    expect(product.code).toBe('SKU-001')
    expect(product.price).toBe('99,90')
    expect(product.photos).toHaveLength(2)
    expect(product.categoryId).toBe('cat-1')
  })

  it('lança UserNotFound se userId não existir', async () => {
    await expect(
      sut.execute({ title: 'X', photos: [], userId: 'id-fantasma' }),
    ).rejects.toThrow(UserNotFound)
  })
})
