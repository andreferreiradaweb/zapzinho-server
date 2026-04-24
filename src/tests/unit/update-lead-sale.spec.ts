import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UpdateLeadSaleUseCase } from '@/use-cases/lead-sale/update-lead-sale'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { InMemoryLeadSaleRepository } from '@/tests/repositories/in-memory-lead-sale-repository'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn().mockResolvedValue([
        { id: 'prod-1', price: '150,00' },
        { id: 'prod-2', price: '75,50' },
      ]),
    },
  },
}))

const OWNER_ID = 'owner-1'
const OTHER_ID = 'other-1'
const SALE_ID = 'sale-1'
const LEAD_ID = 'lead-1'

describe('UpdateLeadSaleUseCase', () => {
  let saleRepo: InMemoryLeadSaleRepository
  let sut: UpdateLeadSaleUseCase

  beforeEach(async () => {
    saleRepo = new InMemoryLeadSaleRepository()
    sut = new UpdateLeadSaleUseCase(saleRepo)

    await saleRepo.create({
      id: SALE_ID,
      leadId: LEAD_ID,
      userId: OWNER_ID,
      discount: 0,
      items: [{ productId: 'prod-1', quantity: 1, price: 150 }],
    })
  })

  it('atualiza venda com sucesso', async () => {
    const sale = await sut.execute({
      saleId: SALE_ID,
      userId: OWNER_ID,
      discount: 10,
      items: [{ productId: 'prod-2', quantity: 3 }],
    })

    expect(sale.discount).toBe(10)
    expect(sale.Items).toHaveLength(1)
    expect(sale.Items[0].productId).toBe('prod-2')
    expect(sale.Items[0].quantity).toBe(3)
  })

  it('aplica o preço do produto ao item atualizado', async () => {
    const sale = await sut.execute({
      saleId: SALE_ID,
      userId: OWNER_ID,
      discount: 0,
      items: [{ productId: 'prod-1', quantity: 1 }],
    })

    expect(sale.Items[0].price).toBe(150)
  })

  it('atualiza com múltiplos itens', async () => {
    const sale = await sut.execute({
      saleId: SALE_ID,
      userId: OWNER_ID,
      discount: 5,
      items: [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-2', quantity: 1 },
      ],
    })

    expect(sale.Items).toHaveLength(2)
    expect(sale.discount).toBe(5)
  })

  it('lança ResourceNotFound se venda não existir', async () => {
    await expect(
      sut.execute({
        saleId: 'sale-fantasma',
        userId: OWNER_ID,
        discount: 0,
        items: [{ productId: 'prod-1', quantity: 1 }],
      }),
    ).rejects.toThrow(ResourceNotFound)
  })

  it('lança InvalidCredentialsError se userId não é dono da venda', async () => {
    await expect(
      sut.execute({
        saleId: SALE_ID,
        userId: OTHER_ID,
        discount: 0,
        items: [{ productId: 'prod-1', quantity: 1 }],
      }),
    ).rejects.toThrow(InvalidCredentialsError)
  })
})
