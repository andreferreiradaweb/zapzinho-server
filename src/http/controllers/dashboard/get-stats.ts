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
      select: {
        createdAt: true,
        updatedAt: true,
        LeadItems: { select: { quantity: true, Product: { select: { price: true } } } },
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

  const totalRevenue = vendidoLeads.reduce((acc, l) => {
    const itemsRevenue = l.LeadItems.reduce((sum, item) => {
      const price = parseFloat(item.Product?.price?.replace(',', '.') ?? '0') || 0
      return sum + price * item.quantity
    }, 0)
    return acc + itemsRevenue
  }, 0)

  return reply.status(200).send({
    totalLeads,
    totalVendidos,
    conversionRate,
    leadsWithoutProduct,
    avgConversionDays,
    totalRevenue,
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
