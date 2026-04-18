import { Prisma, LeadStatus, Product, Lead } from '@/lib/prisma'
import { LeadRepository } from '../lead'
import { prisma } from '@/lib/prisma'

/**
 * Exclude leads who already received a broadcast within the given window.
 * "not sent in last Xh" → lastBroadcastAt IS NULL OR lastBroadcastAt < now - X
 */
function buildLastBroadcastFilter(range: string): Prisma.DateTimeNullableFilter {
  const now = new Date()
  const map: Record<string, number> = {
    '6h':  6  * 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '1d':  24 * 60 * 60 * 1000,
    '3d':  3  * 24 * 60 * 60 * 1000,
    '1w':  7  * 24 * 60 * 60 * 1000,
    '2w':  14 * 24 * 60 * 60 * 1000,
    '1m':  30 * 24 * 60 * 60 * 1000,
  }
  const ms = map[range]
  if (!ms) return {}
  // only include leads whose last broadcast was BEFORE the cutoff (or never sent)
  return { lt: new Date(now.getTime() - ms) }
}

function buildLastMessageFilter(range: string): Prisma.DateTimeNullableFilter {
  const now = new Date()
  const map: Record<string, number> = {
    '1h':    1 * 60 * 60 * 1000,
    '2h':    2 * 60 * 60 * 1000,
    '4h':    4 * 60 * 60 * 1000,
    '8h':    8 * 60 * 60 * 1000,
    '1d':   24 * 60 * 60 * 1000,
    '1w':    7 * 24 * 60 * 60 * 1000,
    '1m':   30 * 24 * 60 * 60 * 1000,
  }
  if (range === 'over1m') {
    return { lt: new Date(now.getTime() - map['1m']) }
  }
  const ms = map[range]
  if (!ms) return {}
  return { gte: new Date(now.getTime() - ms) }
}

interface LeadWithProduct extends Lead {
  Product: Product
}

export class PrismaLeadRepository implements LeadRepository {
  async findLeadWhereUserByNumber(userId: string, number: string) {
    return prisma.lead.findFirst({
      where: {
        userId,
        telefone: number,
      },
    })
  }

  async findLeadById(leadId: string) {
    return prisma.lead.findUnique({
      where: {
        id: leadId,
      },
    })
  }

  async findManyByUserId(userId: string) {
    const leads = await prisma.lead.findMany({
      where: {
        userId,
      },
    })

    return leads
  }

  async filterManyByUserId(
    userId: string,
    offset: number,
    limit: number,
    search: string,
    status?: LeadStatus,
    startDate?: string,
    endDate?: string,
    phone?: string,
    productId?: string,
    categoryId?: string,
  ) {
    const where: Prisma.LeadWhereInput = { userId }

    if (status) where.Status = { equals: status }
    if (search) where.OR = [
      { nome: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { telefone: { contains: search } },
    ]
    if (productId) where.productId = { equals: productId }
    if (categoryId) where.Product = { categoryId }
    if (phone) where.telefone = { contains: phone.replace(/\D/g, '') }
    if (startDate && endDate) {
      where.createdAt = { gte: new Date(startDate), lte: new Date(endDate) }
    }

    return prisma.lead.findMany({
      where,
      skip: offset,
      take: Number(limit),
      include: { Product: { include: { Category: true } } },
      orderBy: { createdAt: 'desc' },
    }) as Promise<LeadWithProduct[]>
  }

  async countByUserId(
    userId: string,
    search: string,
    status?: LeadStatus,
    startDate?: string,
    endDate?: string,
    phone?: string,
    productId?: string,
    categoryId?: string,
  ) {
    const where: Prisma.LeadWhereInput = { userId }

    if (status) where.Status = { equals: status }
    if (search) where.OR = [
      { nome: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { telefone: { contains: search } },
    ]
    if (productId) where.productId = { equals: productId }
    if (categoryId) where.Product = { categoryId }
    if (phone) where.telefone = { contains: phone.replace(/\D/g, '') }
    if (startDate && endDate) {
      where.createdAt = { gte: new Date(startDate), lte: new Date(endDate) }
    }

    return prisma.lead.count({ where })
  }

  async delete(id: string) {
    await prisma.broadcastLead.deleteMany({ where: { leadId: id } })
    await prisma.messageLog.updateMany({ where: { leadId: id }, data: { leadId: null } })
    return prisma.lead.delete({ where: { id } })
  }

  async create(data: Prisma.LeadUncheckedCreateInput) {
    return prisma.lead.create({
      data,
    })
  }

  async update(data: Prisma.LeadUncheckedUpdateInput) {
    return prisma.lead.update({
      where: {
        id: String(data.id),
      },
      data,
    })
  }

  async findAllForBroadcast(userId: string, productId?: string, status?: LeadStatus, lastMessageRange?: string, lastBroadcastRange?: string, categoryId?: string) {
    const lastMessageFilter = lastMessageRange ? buildLastMessageFilter(lastMessageRange) : undefined
    const lastBroadcastFilter = lastBroadcastRange ? buildLastBroadcastFilter(lastBroadcastRange) : undefined

    return prisma.lead.findMany({
      where: {
        userId,
        ...(productId ? { productId } : {}),
        ...(categoryId ? { Product: { categoryId } } : {}),
        ...(status ? { Status: status } : {}),
        ...(lastMessageFilter ? { lastClientMessageAt: lastMessageFilter } : {}),
        ...(lastBroadcastFilter ? { lastBroadcastAt: lastBroadcastFilter } : {}),
      },
    })
  }
}
