import { describe, it, expect, beforeEach } from 'vitest'
import { ListProductsUseCase } from '@/use-cases/product/list-products'
import { UserNotFound } from '@/error/user-not-found'
import { InMemoryUserRepository } from '@/tests/repositories/in-memory-user-repository'
import { InMemoryProductRepository } from '@/tests/repositories/in-memory-product-repository'

const OWNER_ID = 'owner-1'

describe('ListProductsUseCase', () => {
  let userRepo: InMemoryUserRepository
  let productRepo: InMemoryProductRepository
  let sut: ListProductsUseCase

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository()
    productRepo = new InMemoryProductRepository()
    sut = new ListProductsUseCase(productRepo, userRepo)

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

  it('retorna lista vazia quando não há produtos', async () => {
    const result = await sut.execute({ userId: OWNER_ID })

    expect(result.products).toHaveLength(0)
    expect(result.totalItems).toBe(0)
  })

  it('lista produtos do usuário com sucesso', async () => {
    await productRepo.create({ title: 'Produto A', photos: [], userId: OWNER_ID })
    await productRepo.create({ title: 'Produto B', photos: [], userId: OWNER_ID })

    const result = await sut.execute({ userId: OWNER_ID })

    expect(result.products).toHaveLength(2)
    expect(result.totalItems).toBe(2)
    expect(result.currentPage).toBe(1)
  })

  it('não lista produtos de outro usuário', async () => {
    await productRepo.create({ title: 'Produto A', photos: [], userId: 'outro-user' })
    await productRepo.create({ title: 'Produto B', photos: [], userId: OWNER_ID })

    const result = await sut.execute({ userId: OWNER_ID })

    expect(result.products).toHaveLength(1)
    expect(result.products[0].title).toBe('Produto B')
  })

  it('respeita paginação', async () => {
    for (let i = 1; i <= 5; i++) {
      await productRepo.create({ title: `Produto ${i}`, photos: [], userId: OWNER_ID })
    }

    const page1 = await sut.execute({ userId: OWNER_ID, page: 1, limit: 3 })
    const page2 = await sut.execute({ userId: OWNER_ID, page: 2, limit: 3 })

    expect(page1.products).toHaveLength(3)
    expect(page2.products).toHaveLength(2)
    expect(page1.totalItems).toBe(5)
  })

  it('lança UserNotFound se userId não existir', async () => {
    await expect(
      sut.execute({ userId: 'id-fantasma' }),
    ).rejects.toThrow(UserNotFound)
  })
})
