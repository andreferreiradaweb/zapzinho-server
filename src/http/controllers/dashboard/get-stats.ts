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

  const [totalLeads, totalVendidos, leadsByStatus, topCategories, topProducts] =
    await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.count({ where: { ...where, Status: LeadStatus.VENDIDO } }),
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

  return reply.status(200).send({
    totalLeads,
    totalVendidos,
    conversionRate,
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
