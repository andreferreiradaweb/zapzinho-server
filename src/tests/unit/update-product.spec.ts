import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateProductUseCase } from '@/use-cases/product/update-product'
import { UserNotFound } from '@/error/user-not-found'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { InactiveUser } from '@/error/inactive-user'
import { InMemoryUserRepository } from '@/tests/repositories/in-memory-user-repository'
import { InMemoryProductRepository } from '@/tests/repositories/in-memory-product-repository'

const OWNER_ID = 'owner-1'
const OTHER_ID = 'other-1'
const PRODUCT_ID = 'prod-1'

describe('UpdateProductUseCase', () => {
  let userRepo: InMemoryUserRepository
  let productRepo: InMemoryProductRepository
  let sut: UpdateProductUseCase

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository()
    productRepo = new InMemoryProductRepository()
    sut = new UpdateProductUseCase(productRepo, userRepo)

    await userRepo.create({
      id: OWNER_ID,
      email: 'dono@empresa.com',
      passwordHash: 'hash',
      Role: 'CLIENT',
      CustomerType: 'B2C',
      isActive: true,
      emailVerified: true,
    })

    await userRepo.create({
      id: OTHER_ID,
      email: 'outro@empresa.com',
      passwordHash: 'hash',
      Role: 'CLIENT',
      CustomerType: 'B2C',
      isActive: true,
      emailVerified: true,
    })

    await productRepo.create({
      id: PRODUCT_ID,
      title: 'Produto Original',
      photos: [],
      userId: OWNER_ID,
    })
  })

  it('atualiza produto com sucesso', async () => {
    const { product } = await sut.execute({
      id: PRODUCT_ID,
      title: 'Produto Atualizado',
      photos: ['nova-foto.jpg'],
      userId: OWNER_ID,
    })

    expect(product.title).toBe('Produto Atualizado')
    expect(product.photos).toContain('nova-foto.jpg')
  })

  it('lança UserNotFound se userId não existir', async () => {
    await expect(
      sut.execute({ id: PRODUCT_ID, title: 'X', photos: [], userId: 'id-fantasma' }),
    ).rejects.toThrow(UserNotFound)
  })

  it('lança ResourceNotFound se produto não existir', async () => {
    await expect(
      sut.execute({ id: 'prod-fantasma', title: 'X', photos: [], userId: OWNER_ID }),
    ).rejects.toThrow(ResourceNotFound)
  })

  it('lança InvalidCredentialsError se produto pertence a outro usuário', async () => {
    await expect(
      sut.execute({ id: PRODUCT_ID, title: 'X', photos: [], userId: OTHER_ID }),
    ).rejects.toThrow(InvalidCredentialsError)
  })

  it('lança InactiveUser se usuário está inativo', async () => {
    await userRepo.update({ id: OWNER_ID, isActive: false } as any)

    await expect(
      sut.execute({ id: PRODUCT_ID, title: 'X', photos: [], userId: OWNER_ID }),
    ).rejects.toThrow(InactiveUser)
  })
})
