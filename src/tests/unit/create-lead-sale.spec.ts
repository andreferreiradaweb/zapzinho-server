import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateLeadSaleUseCase } from '@/use-cases/lead-sale/create-lead-sale'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { InMemoryLeadRepository } from '@/tests/repositories/in-memory-lead-repository'
import { InMemoryLeadSaleRepository } from '@/tests/repositories/in-memory-lead-sale-repository'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn().mockResolvedValue([
        { id: 'prod-1', price: '100,00' },
        { id: 'prod-2', price: '50,00' },
      ]),
    },
  },
  LeadStatus: { VENDIDO: 'VENDIDO' },
}))

const OWNER_ID = 'owner-1'
const OTHER_ID = 'other-1'
const LEAD_ID = 'lead-1'

describe('CreateLeadSaleUseCase — registro de venda', () => {
  let leadRepo: InMemoryLeadRepository
  let saleRepo: InMemoryLeadSaleRepository
  let sut: CreateLeadSaleUseCase

  beforeEach(async () => {
    leadRepo = new InMemoryLeadRepository()
    saleRepo = new InMemoryLeadSaleRepository()
    sut = new CreateLeadSaleUseCase(saleRepo, leadRepo)

    await leadRepo.create({
      id: LEAD_ID,
      nome: 'João',
      telefone: '11999990000',
      message: 'Interesse',
      Status: 'NEGOCIACAO',
      userId: OWNER_ID,
    })
  })

  it('registra uma venda com sucesso e move lead para VENDIDO', async () => {
    const sale = await sut.execute({
      leadId: LEAD_ID,
      userId: OWNER_ID,
      discount: 0,
      items: [{ productId: 'prod-1', quantity: 1 }],
    })

    expect(sale.leadId).toBe(LEAD_ID)
    expect(sale.Items).toHaveLength(1)
    expect(sale.Items[0].productId).toBe('prod-1')

    // lead deve ter sido movido para VENDIDO
    const lead = leadRepo.items.find((l) => l.id === LEAD_ID)
    expect(lead?.Status).toBe('VENDIDO')
  })

  it('registra venda com múltiplos produtos', async () => {
    const sale = await sut.execute({
      leadId: LEAD_ID,
      userId: OWNER_ID,
      discount: 10,
      items: [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-2', quantity: 3 },
      ],
    })

    expect(sale.Items).toHaveLength(2)
    expect(sale.discount).toBe(10)
  })

  it('aplica o preço do produto ao item da venda', async () => {
    const sale = await sut.execute({
      leadId: LEAD_ID,
      userId: OWNER_ID,
      discount: 0,
      items: [{ productId: 'prod-1', quantity: 1 }],
    })

    expect(sale.Items[0].price).toBe(100)
  })

  it('lança ResourceNotFound se lead não existe', async () => {
    await expect(
      sut.execute({
        leadId: 'lead-fantasma',
        userId: OWNER_ID,
        discount: 0,
        items: [{ productId: 'prod-1', quantity: 1 }],
      }),
    ).rejects.toThrow(ResourceNotFound)
  })

  it('lança InvalidCredentialsError se userId não é dono do lead', async () => {
    await expect(
      sut.execute({
        leadId: LEAD_ID,
        userId: OTHER_ID,
        discount: 0,
        items: [{ productId: 'prod-1', quantity: 1 }],
      }),
    ).rejects.toThrow(InvalidCredentialsError)
  })

  it('armazena a venda no repositório', async () => {
    await sut.execute({
      leadId: LEAD_ID,
      userId: OWNER_ID,
      discount: 0,
      items: [{ productId: 'prod-1', quantity: 1 }],
    })

    const salesForLead = await saleRepo.findByLeadId(LEAD_ID)
    expect(salesForLead).toHaveLength(1)
  })

  it('vincula o produto do item ao lead como productId principal', async () => {
    await sut.execute({
      leadId: LEAD_ID,
      userId: OWNER_ID,
      discount: 0,
      items: [{ productId: 'prod-2', quantity: 1 }],
    })

    const lead = leadRepo.items.find((l) => l.id === LEAD_ID)
    expect(lead?.productId).toBe('prod-2')
  })
})
