import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { LeadStatus, Role } from '@/lib/prisma'

export async function GetDashboardStatsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const querySchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    targetUserId: z.string().optional(),
    productId: z.string().optional(),
    categoryId: z.string().optional(),
  })

  const { sub } = request.user
  const { startDate, endDate, targetUserId, productId, categoryId } =
    querySchema.parse(request.query)

  const requestingUser = await prisma.user.findUnique({ where: { id: sub } })
  const isAdmin = requestingUser?.Role === Role.ADMIN

  const userId = isAdmin && targetUserId ? targetUserId : sub

  const now = new Date()
  const defaultStart = new Date(now)
  defaultStart.setDate(defaultStart.getDate() - 30)

  const from = startDate ? new Date(startDate) : defaultStart
  const to = endDate ? new Date(endDate) : now

  const where = {
    userId,
    createdAt: { gte: from, lte: to },
    ...(productId ? { productId } : {}),
    ...(categoryId ? { categoryId } : {}),
  }

  const [
    totalLeads,
    totalVendidos,
    leadsWithoutProduct,
    leadsByStatus,
    topCategories,
    topProducts,
    vendidoLeads,
    saleItems,
    recentLeads,
  ] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.count({ where: { ...where, Status: LeadStatus.VENDIDO } }),
    prisma.lead.count({ where: { ...where, productId: null } }),
    prisma.lead.groupBy({
      by: ['Status'],
      where,
      _count: { _all: true },
    }),
    prisma.lead.groupBy({
      by: ['categoryId'],
      where: { ...where, categoryId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { categoryId: 'desc' } },
      take: 5,
    }),
    prisma.lead.groupBy({
      by: ['productId'],
      where: { ...where, productId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 5,
    }),
    prisma.lead.findMany({
      where: { ...where, Status: LeadStatus.VENDIDO },
      select: { createdAt: true, updatedAt: true },
    }),
    prisma.leadSale.findMany({
      where: {
        userId,
        createdAt: { gte: from, lte: to },
        ...(productId ? { Lead: { productId } } : {}),
        ...(categoryId ? { Lead: { categoryId } } : {}),
      },
      select: {
        discount: true,
        Items: { select: { price: true, quantity: true, Product: { select: { costPrice: true } } } },
      },
    }),
    prisma.lead.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        nome: true,
        telefone: true,
        Status: true,
        createdAt: true,
        Category: { select: { name: true } },
        Product: { select: { title: true } },
        LeadItems: { select: { quantity: true, Product: { select: { title: true, price: true } } } },
      },
    }),
  ])

  const categoryIds = topCategories
    .map((c) => c.categoryId)
    .filter(Boolean) as string[]
  const productIds = topProducts
    .map((p) => p.productId)
    .filter(Boolean) as string[]

  const [categories, products] = await Promise.all([
    prisma.productCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    }),
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true },
    }),
  ])

  const conversionRate =
    totalLeads > 0 ? Math.round((totalVendidos / totalLeads) * 100) : 0

  const avgConversionDays =
    vendidoLeads.length > 0
      ? Math.round(
          vendidoLeads.reduce((acc, l) => {
            const diff =
              (l.updatedAt.getTime() - l.createdAt.getTime()) /
              (1000 * 60 * 60 * 24)
            return acc + diff
          }, 0) / vendidoLeads.length,
        )
      : null

  const sales = saleItems

  const totalGrossRevenue = sales.reduce(
    (acc, sale) =>
      acc + sale.Items.reduce((s, item) => s + (item.price || 0) * item.quantity, 0),
    0,
  )

  const totalDiscount = sales.reduce((acc, sale) => acc + (sale.discount || 0), 0)

  const totalRevenue = totalGrossRevenue - totalDiscount

  const totalCost = sales.reduce((acc, sale) => {
    return (
      acc +
      sale.Items.reduce((s, item) => {
        if (!item.Product?.costPrice) return s
        const cost = parseFloat(item.Product.costPrice.replace(',', '.'))
        if (!Number.isFinite(cost) || cost <= 0) return s
        return s + cost * item.quantity
      }, 0)
    )
  }, 0)

  const totalProfit = totalRevenue - totalCost

  return reply.status(200).send({
    totalLeads,
    totalVendidos,
    conversionRate,
    leadsWithoutProduct,
    avgConversionDays,
    totalRevenue,
    totalCost,
    totalDiscount,
    totalProfit,
    totalSalesCount: sales.length,
    recentLeads,
    leadsByStatus: leadsByStatus.map((s) => ({
      status: s.Status,
      count: s._count._all,
    })),
    topCategories: topCategories.map((c) => ({
      name: categories.find((cat) => cat.id === c.categoryId)?.name ?? '—',
      count: c._count._all,
    })),
    topProducts: topProducts.map((p) => ({
      title: products.find((prod) => prod.id === p.productId)?.title ?? '—',
      count: p._count._all,
    })),
  })
}
