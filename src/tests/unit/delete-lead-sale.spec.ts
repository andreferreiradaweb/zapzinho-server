import { describe, it, expect, beforeEach } from 'vitest'
import { DeleteLeadSaleUseCase } from '@/use-cases/lead-sale/delete-lead-sale'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { InMemoryLeadSaleRepository } from '@/tests/repositories/in-memory-lead-sale-repository'
import { InMemoryLeadRepository } from '@/tests/repositories/in-memory-lead-repository'

const OWNER_ID = 'owner-1'
const OTHER_ID = 'other-1'
const LEAD_ID = 'lead-1'
const SALE_ID = 'sale-1'
const SALE_ID_2 = 'sale-2'

describe('DeleteLeadSaleUseCase', () => {
  let saleRepo: InMemoryLeadSaleRepository
  let leadRepo: InMemoryLeadRepository
  let sut: DeleteLeadSaleUseCase

  beforeEach(async () => {
    saleRepo = new InMemoryLeadSaleRepository()
    leadRepo = new InMemoryLeadRepository()
    sut = new DeleteLeadSaleUseCase(saleRepo, leadRepo)

    await leadRepo.create({
      id: LEAD_ID,
      nome: 'Lead Teste',
      telefone: '11999990000',
      message: 'msg',
      Status: 'VENDIDO',
      userId: OWNER_ID,
    })
  })

  it('deleta venda com sucesso', async () => {
    await saleRepo.create({
      id: SALE_ID,
      leadId: LEAD_ID,
      userId: OWNER_ID,
      discount: 0,
      items: [{ productId: 'prod-1', quantity: 1, price: 100 }],
    })

    await sut.execute({ saleId: SALE_ID, userId: OWNER_ID })

    expect(saleRepo.items).toHaveLength(0)
  })

  it('reverte lead para NEGOCIACAO quando não há mais vendas', async () => {
    await saleRepo.create({
      id: SALE_ID,
      leadId: LEAD_ID,
      userId: OWNER_ID,
      discount: 0,
      items: [{ productId: 'prod-1', quantity: 1, price: 100 }],
    })

    await sut.execute({ saleId: SALE_ID, userId: OWNER_ID })

    const lead = leadRepo.items.find((l) => l.id === LEAD_ID)
    expect(lead?.Status).toBe('NEGOCIACAO')
  })

  it('mantém lead como VENDIDO se ainda há outras vendas', async () => {
    await saleRepo.create({
      id: SALE_ID,
      leadId: LEAD_ID,
      userId: OWNER_ID,
      discount: 0,
      items: [{ productId: 'prod-1', quantity: 1, price: 100 }],
    })
    await saleRepo.create({
      id: SALE_ID_2,
      leadId: LEAD_ID,
      userId: OWNER_ID,
      discount: 0,
      items: [{ productId: 'prod-2', quantity: 1, price: 50 }],
    })

    await sut.execute({ saleId: SALE_ID, userId: OWNER_ID })

    const lead = leadRepo.items.find((l) => l.id === LEAD_ID)
    expect(lead?.Status).toBe('VENDIDO')
    expect(saleRepo.items).toHaveLength(1)
  })

  it('lança ResourceNotFound se venda não existir', async () => {
    await expect(
      sut.execute({ saleId: 'sale-fantasma', userId: OWNER_ID }),
    ).rejects.toThrow(ResourceNotFound)
  })

  it('lança InvalidCredentialsError se userId não é dono da venda', async () => {
    await saleRepo.create({
      id: SALE_ID,
      leadId: LEAD_ID,
      userId: OWNER_ID,
      discount: 0,
      items: [{ productId: 'prod-1', quantity: 1, price: 100 }],
    })

    await expect(
      sut.execute({ saleId: SALE_ID, userId: OTHER_ID }),
    ).rejects.toThrow(InvalidCredentialsError)
  })
})
