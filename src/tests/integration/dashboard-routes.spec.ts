import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { hash } from 'bcrypt'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    lead: {
      count: vi.fn().mockResolvedValue(0),
      groupBy: vi.fn().mockResolvedValue([]),
      findMany: vi.fn().mockResolvedValue([]),
    },
    leadSale: { findMany: vi.fn().mockResolvedValue([]) },
    productCategory: { findMany: vi.fn().mockResolvedValue([]) },
    product: { findMany: vi.fn().mockResolvedValue([]) },
    messageLog: { create: vi.fn().mockResolvedValue({}) },
  },
  Role: { ADMIN: 'ADMIN', CLIENT: 'CLIENT' },
  LeadStatus: {
    NOVO_INTERESSE: 'NOVO_INTERESSE',
    CONTATO_FEITO: 'CONTATO_FEITO',
    NEGOCIACAO: 'NEGOCIACAO',
    VENDIDO: 'VENDIDO',
    NAO_INTERESSADO: 'NAO_INTERESSADO',
  },
}))

vi.mock('@/lib/resend', () => ({
  resend: { emails: { send: vi.fn().mockResolvedValue({}) } },
}))

vi.mock('@/services/wapi', () => ({
  sendWhatsAppMessage: vi.fn().mockResolvedValue({ success: false }),
  sendWhatsAppImage: vi.fn().mockResolvedValue({ success: false }),
  sendWhatsAppVideo: vi.fn().mockResolvedValue({ success: false }),
  wapiDelay: vi.fn().mockResolvedValue(undefined),
}))

import { prisma } from '@/lib/prisma'
import { InMemoryUserRepository } from '@/tests/repositories/in-memory-user-repository'
import { app } from '@/app'

const userRepo = new InMemoryUserRepository()

vi.mock('@/repositories/prisma/user', () => ({
  PrismaUserRepository: vi.fn().mockImplementation(() => userRepo),
}))

async function getAuthToken(email: string, password: string): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/user/signin',
    payload: { email, password },
  })
  return res.json().token
}

describe('GET /dashboard/stats', () => {
  let token: string

  beforeAll(async () => {
    await app.ready()
    await userRepo.create({
      id: 'client-1',
      email: 'cliente@dashboard.com',
      passwordHash: await hash('Senha123', 6),
      Role: 'CLIENT',
      CustomerType: 'B2C',
      isActive: true,
      emailVerified: true,
    })
    token = await getAuthToken('cliente@dashboard.com', 'Senha123')
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'client-1', Role: 'CLIENT' } as any)
    vi.mocked(prisma.lead.count).mockResolvedValue(0)
    vi.mocked(prisma.lead.groupBy).mockResolvedValue([])
    vi.mocked(prisma.lead.findMany).mockResolvedValue([])
    vi.mocked(prisma.leadSale.findMany).mockResolvedValue([])
    vi.mocked(prisma.productCategory.findMany).mockResolvedValue([])
    vi.mocked(prisma.product.findMany).mockResolvedValue([])
  })

  it('retorna 401 sem token JWT', async () => {
    const res = await app.inject({ method: 'GET', url: '/dashboard/stats' })
    expect(res.statusCode).toBe(401)
  })

  it('retorna 200 com estrutura completa quando não há dados', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/dashboard/stats',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({
      totalLeads: 0,
      totalVendidos: 0,
      conversionRate: 0,
      leadsWithoutProduct: 0,
      avgConversionDays: null,
      totalRevenue: 0,
      totalCost: 0,
      totalDiscount: 0,
      totalProfit: 0,
      totalSalesCount: 0,
      recentLeads: [],
      leadsByStatus: [],
      topCategories: [],
      topProducts: [],
    })
  })

  it('totalProfit é igual ao totalRevenue quando produtos não têm custo cadastrado', async () => {
    vi.mocked(prisma.leadSale.findMany).mockResolvedValue([
      { discount: 0, Items: [{ price: 100, quantity: 2, Product: { costPrice: null } }] },
    ] as any)

    const res = await app.inject({
      method: 'GET',
      url: '/dashboard/stats',
      headers: { authorization: `Bearer ${token}` },
    })

    const body = res.json()
    expect(body.totalRevenue).toBe(200)
    expect(body.totalCost).toBe(0)
    expect(body.totalProfit).toBe(200)
  })

  it('totalProfit deduz custo e desconto corretamente', async () => {
    vi.mocked(prisma.leadSale.findMany).mockResolvedValue([
      { discount: 50, Items: [{ price: 200, quantity: 1, Product: { costPrice: '80' } }] },
    ] as any)

    const res = await app.inject({
      method: 'GET',
      url: '/dashboard/stats',
      headers: { authorization: `Bearer ${token}` },
    })

    const body = res.json()
    expect(body.totalRevenue).toBe(150)  // 200 - 50
    expect(body.totalCost).toBe(80)
    expect(body.totalProfit).toBe(70)    // 150 - 80
    expect(body.totalSalesCount).toBe(1)
  })

  it('parseia costPrice com vírgula como separador decimal (ex: "80,50")', async () => {
    vi.mocked(prisma.leadSale.findMany).mockResolvedValue([
      { discount: 0, Items: [{ price: 100, quantity: 1, Product: { costPrice: '80,50' } }] },
    ] as any)

    const res = await app.inject({
      method: 'GET',
      url: '/dashboard/stats',
      headers: { authorization: `Bearer ${token}` },
    })

    const body = res.json()
    expect(body.totalRevenue).toBe(100)
    expect(body.totalCost).toBe(80.5)
    expect(body.totalProfit).toBeCloseTo(19.5)
  })

  it('soma múltiplas vendas no período', async () => {
    vi.mocked(prisma.leadSale.findMany).mockResolvedValue([
      { discount: 0,  Items: [{ price: 100, quantity: 1, Product: { costPrice: '30' } }] },
      { discount: 20, Items: [{ price: 150, quantity: 2, Product: { costPrice: '50' } }] },
    ] as any)

    const res = await app.inject({
      method: 'GET',
      url: '/dashboard/stats',
      headers: { authorization: `Bearer ${token}` },
    })

    const body = res.json()
    // grossRevenue = 100 + 300 = 400 | discount = 20 | revenue = 380
    // cost = 30 + 100 = 130 | profit = 250
    expect(body.totalRevenue).toBe(380)
    expect(body.totalCost).toBe(130)
    expect(body.totalProfit).toBe(250)
    expect(body.totalDiscount).toBe(20)
  })

  it('calcula taxa de conversão corretamente', async () => {
    vi.mocked(prisma.lead.count)
      .mockResolvedValueOnce(10)  // totalLeads
      .mockResolvedValueOnce(4)   // totalVendidos
      .mockResolvedValueOnce(2)   // leadsWithoutProduct

    const res = await app.inject({
      method: 'GET',
      url: '/dashboard/stats',
      headers: { authorization: `Bearer ${token}` },
    })

    const body = res.json()
    expect(body.totalLeads).toBe(10)
    expect(body.totalVendidos).toBe(4)
    expect(body.conversionRate).toBe(40)
  })

  it('passa o intervalo de datas fornecido para a query de vendas', async () => {
    const startDate = '2026-04-01T03:00:00.000Z'
    const endDate = '2026-04-25T02:59:59.999Z'

    await app.inject({
      method: 'GET',
      url: `/dashboard/stats?startDate=${startDate}&endDate=${endDate}`,
      headers: { authorization: `Bearer ${token}` },
    })

    const saleArgs = vi.mocked(prisma.leadSale.findMany).mock.calls[0]?.[0] as any
    expect(saleArgs.where.createdAt.gte).toEqual(new Date(startDate))
    expect(saleArgs.where.createdAt.lte).toEqual(new Date(endDate))
  })

  it('admin filtra pelos leads do targetUserId informado', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'admin-1', Role: 'ADMIN' } as any)

    await app.inject({
      method: 'GET',
      url: '/dashboard/stats?targetUserId=target-99',
      headers: { authorization: `Bearer ${token}` },
    })

    const countArgs = vi.mocked(prisma.lead.count).mock.calls[0]?.[0] as any
    expect(countArgs.where.userId).toBe('target-99')
  })

  it('cliente usa seu próprio userId mesmo passando targetUserId', async () => {
    await app.inject({
      method: 'GET',
      url: '/dashboard/stats?targetUserId=outro-usuario',
      headers: { authorization: `Bearer ${token}` },
    })

    const countArgs = vi.mocked(prisma.lead.count).mock.calls[0]?.[0] as any
    expect(countArgs.where.userId).toBe('client-1')
  })
})
