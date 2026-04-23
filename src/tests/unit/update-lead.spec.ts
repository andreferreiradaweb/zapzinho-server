import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateLeadUseCase } from '@/use-cases/lead/update-lead'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { InMemoryUserRepository } from '@/tests/repositories/in-memory-user-repository'
import { InMemoryLeadRepository } from '@/tests/repositories/in-memory-lead-repository'

const OWNER_ID = 'owner-1'
const OTHER_USER_ID = 'other-1'
const LEAD_ID = 'lead-1'

describe('UpdateLeadUseCase — ciclo de vida completo do lead', () => {
  let userRepo: InMemoryUserRepository
  let leadRepo: InMemoryLeadRepository
  let sut: UpdateLeadUseCase

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository()
    leadRepo = new InMemoryLeadRepository()
    sut = new UpdateLeadUseCase(leadRepo, userRepo)

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
      id: OTHER_USER_ID,
      email: 'outro@empresa.com',
      passwordHash: 'hash',
      Role: 'CLIENT',
      CustomerType: 'B2C',
      isActive: true,
      emailVerified: true,
    })

    await leadRepo.create({
      id: LEAD_ID,
      nome: 'Maria Silva',
      telefone: '11999990000',
      email: 'maria@email.com',
      message: 'Interesse inicial',
      Status: 'NOVO_INTERESSE',
      userId: OWNER_ID,
    })
  })

  // ── Erros de autorização ───────────────────────────────────────────
  it('lança ResourceNotFound se userId não existir', async () => {
    await expect(
      sut.execute({ id: LEAD_ID, Status: 'NOVO_INTERESSE' as any, userId: 'id-fantasma' }),
    ).rejects.toThrow(ResourceNotFound)
  })

  it('lança ResourceNotFound se leadId não existir', async () => {
    await expect(
      sut.execute({ id: 'lead-fantasma', Status: 'NOVO_INTERESSE' as any, userId: OWNER_ID }),
    ).rejects.toThrow(ResourceNotFound)
  })

  it('lança InvalidCredentialsError se o lead pertence a outro usuário', async () => {
    await expect(
      sut.execute({ id: LEAD_ID, Status: 'NOVO_INTERESSE' as any, userId: OTHER_USER_ID }),
    ).rejects.toThrow(InvalidCredentialsError)
  })

  // ── Edição de campos individuais ──────────────────────────────────
  it('atualiza o nome', async () => {
    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'NOVO_INTERESSE' as any,
      userId: OWNER_ID,
      nome: 'Maria Oliveira',
    })
    expect(lead.nome).toBe('Maria Oliveira')
  })

  it('atualiza o e-mail', async () => {
    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'NOVO_INTERESSE' as any,
      userId: OWNER_ID,
      email: 'novo@email.com',
    })
    expect(lead.email).toBe('novo@email.com')
  })

  it('atualiza o telefone', async () => {
    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'NOVO_INTERESSE' as any,
      userId: OWNER_ID,
      telefone: '11988880000',
    })
    expect(lead.telefone).toBe('11988880000')
  })

  it('atualiza a mensagem do cliente', async () => {
    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'NOVO_INTERESSE' as any,
      userId: OWNER_ID,
      message: 'Nova mensagem',
    })
    expect(lead.message).toBe('Nova mensagem')
  })

  it('atualiza o comentário do vendedor (sellerNote)', async () => {
    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'NOVO_INTERESSE' as any,
      userId: OWNER_ID,
      sellerNote: 'Lead quente, ligar amanhã',
    })
    expect(lead.sellerNote).toBe('Lead quente, ligar amanhã')
  })

  it('atualiza sellerNote mesmo quando status já é VENDIDO', async () => {
    await leadRepo.update({ id: LEAD_ID, Status: 'VENDIDO' as any })

    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'VENDIDO' as any,
      userId: OWNER_ID,
      sellerNote: 'Venda confirmada, entrega segunda',
    })
    expect(lead.sellerNote).toBe('Venda confirmada, entrega segunda')
    expect(lead.Status).toBe('VENDIDO')
  })

  it('limpa o sellerNote (null)', async () => {
    await leadRepo.update({ id: LEAD_ID, sellerNote: 'Alguma nota', Status: 'NOVO_INTERESSE' as any })

    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'NOVO_INTERESSE' as any,
      userId: OWNER_ID,
      sellerNote: null,
    })
    expect(lead.sellerNote).toBeNull()
  })

  it('vincula a um produto de interesse (productId)', async () => {
    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'NOVO_INTERESSE' as any,
      userId: OWNER_ID,
      productId: 'prod-abc',
    })
    expect(lead.productId).toBe('prod-abc')
  })

  it('vincula a uma categoria (categoryId)', async () => {
    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'NOVO_INTERESSE' as any,
      userId: OWNER_ID,
      categoryId: 'cat-xyz',
    })
    expect(lead.categoryId).toBe('cat-xyz')
  })

  it('atualiza items (produtos de interesse múltiplos)', async () => {
    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'NOVO_INTERESSE' as any,
      userId: OWNER_ID,
      items: [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-2', quantity: 1 },
      ],
    })
    // item[0] vira productId principal
    expect(lead.productId).toBe('prod-1')
  })

  it('atualiza items vazio remove vínculo de produto', async () => {
    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'NOVO_INTERESSE' as any,
      userId: OWNER_ID,
      items: [],
    })
    expect(lead.productId).toBeNull()
  })

  it('registra data de entrega', async () => {
    const delivery = '2026-12-31T00:00:00.000Z'
    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'NOVO_INTERESSE' as any,
      userId: OWNER_ID,
      deliveryDate: delivery,
    })
    expect(lead.deliveryDate?.toISOString()).toBe(delivery)
  })

  it('marca como entregue', async () => {
    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'NOVO_INTERESSE' as any,
      userId: OWNER_ID,
      delivered: true,
    })
    expect(lead.delivered).toBe(true)
  })

  // ── Movendo por todas as etapas ───────────────────────────────────
  it('move NOVO_INTERESSE → CONTATO_FEITO', async () => {
    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'CONTATO_FEITO' as any,
      userId: OWNER_ID,
    })
    expect(lead.Status).toBe('CONTATO_FEITO')
  })

  it('move CONTATO_FEITO → NEGOCIACAO', async () => {
    await leadRepo.update({ id: LEAD_ID, Status: 'CONTATO_FEITO' as any })
    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'NEGOCIACAO' as any,
      userId: OWNER_ID,
    })
    expect(lead.Status).toBe('NEGOCIACAO')
  })

  it('move NEGOCIACAO → VENDIDO', async () => {
    await leadRepo.update({ id: LEAD_ID, Status: 'NEGOCIACAO' as any })
    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'VENDIDO' as any,
      userId: OWNER_ID,
    })
    expect(lead.Status).toBe('VENDIDO')
  })

  it('move qualquer status → NAO_INTERESSADO', async () => {
    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'NAO_INTERESSADO' as any,
      userId: OWNER_ID,
    })
    expect(lead.Status).toBe('NAO_INTERESSADO')
  })

  it('volta de VENDIDO → NEGOCIACAO (reversão)', async () => {
    await leadRepo.update({ id: LEAD_ID, Status: 'VENDIDO' as any })
    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'NEGOCIACAO' as any,
      userId: OWNER_ID,
    })
    expect(lead.Status).toBe('NEGOCIACAO')
  })

  it('atualiza múltiplos campos em uma única chamada', async () => {
    const { lead } = await sut.execute({
      id: LEAD_ID,
      Status: 'CONTATO_FEITO' as any,
      userId: OWNER_ID,
      nome: 'Maria Completa',
      email: 'completa@email.com',
      telefone: '11977770000',
      sellerNote: 'Cliente VIP',
      categoryId: 'cat-1',
      productId: 'prod-1',
    })
    expect(lead.Status).toBe('CONTATO_FEITO')
    expect(lead.nome).toBe('Maria Completa')
    expect(lead.email).toBe('completa@email.com')
    expect(lead.sellerNote).toBe('Cliente VIP')
  })
})
