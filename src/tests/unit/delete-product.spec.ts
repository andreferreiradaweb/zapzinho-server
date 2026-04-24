import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DeleteProductUseCase } from '@/use-cases/product/delete-product'
import { UserNotFound } from '@/error/user-not-found'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { InactiveUser } from '@/error/inactive-user'
import { InMemoryUserRepository } from '@/tests/repositories/in-memory-user-repository'
import { InMemoryProductRepository } from '@/tests/repositories/in-memory-product-repository'

vi.mock('@/services/cloudinary', () => ({
  deleteManyFromCloudinary: vi.fn().mockResolvedValue(undefined),
}))

import { deleteManyFromCloudinary } from '@/services/cloudinary'

const OWNER_ID = 'owner-1'
const OTHER_ID = 'other-1'
const PRODUCT_ID = 'prod-1'

describe('DeleteProductUseCase', () => {
  let userRepo: InMemoryUserRepository
  let productRepo: InMemoryProductRepository
  let sut: DeleteProductUseCase

  beforeEach(async () => {
    vi.clearAllMocks()
    userRepo = new InMemoryUserRepository()
    productRepo = new InMemoryProductRepository()
    sut = new DeleteProductUseCase(productRepo, userRepo)

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
  })

  it('deleta produto sem fotos com sucesso', async () => {
    await productRepo.create({ id: PRODUCT_ID, title: 'Produto', photos: [], userId: OWNER_ID })

    await sut.execute({ id: PRODUCT_ID, userId: OWNER_ID })

    expect(productRepo.items).toHaveLength(0)
    expect(vi.mocked(deleteManyFromCloudinary)).not.toHaveBeenCalled()
  })

  it('chama deleteManyFromCloudinary quando produto tem fotos', async () => {
    await productRepo.create({
      id: PRODUCT_ID,
      title: 'Com Fotos',
      photos: ['url1', 'url2'],
      userId: OWNER_ID,
    })

    await sut.execute({ id: PRODUCT_ID, userId: OWNER_ID })

    expect(vi.mocked(deleteManyFromCloudinary)).toHaveBeenCalledWith(['url1', 'url2'])
    expect(productRepo.items).toHaveLength(0)
  })

  it('lança UserNotFound se userId não existir', async () => {
    await productRepo.create({ id: PRODUCT_ID, title: 'X', photos: [], userId: OWNER_ID })

    await expect(
      sut.execute({ id: PRODUCT_ID, userId: 'id-fantasma' }),
    ).rejects.toThrow(UserNotFound)
  })

  it('lança ResourceNotFound se produto não existir', async () => {
    await expect(
      sut.execute({ id: 'prod-fantasma', userId: OWNER_ID }),
    ).rejects.toThrow(ResourceNotFound)
  })

  it('lança InvalidCredentialsError se produto pertence a outro usuário', async () => {
    await productRepo.create({ id: PRODUCT_ID, title: 'X', photos: [], userId: OWNER_ID })

    await expect(
      sut.execute({ id: PRODUCT_ID, userId: OTHER_ID }),
    ).rejects.toThrow(InvalidCredentialsError)
  })

  it('lança InactiveUser se usuário está inativo', async () => {
    await userRepo.update({ id: OWNER_ID, isActive: false } as any)
    await productRepo.create({ id: PRODUCT_ID, title: 'X', photos: [], userId: OWNER_ID })

    await expect(
      sut.execute({ id: PRODUCT_ID, userId: OWNER_ID }),
    ).rejects.toThrow(InactiveUser)
  })
})
