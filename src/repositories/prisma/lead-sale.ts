import { prisma } from '@/lib/prisma'
import { LeadSaleRepository, LeadSaleItemInput, LeadSaleWithItems } from '../lead-sale'

export class PrismaLeadSaleRepository implements LeadSaleRepository {
  async create(data: {
    id: string
    leadId: string
    userId: string
    items: LeadSaleItemInput[]
  }) {
    return prisma.leadSale.create({
      data: {
        id: data.id,
        leadId: data.leadId,
        userId: data.userId,
        Items: {
          create: data.items.map((item) => ({
            id: require('crypto').randomUUID(),
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    })
  }

  async findByLeadId(leadId: string): Promise<LeadSaleWithItems[]> {
    return prisma.leadSale.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
      include: {
        Items: {
          include: {
            Product: { select: { title: true, price: true } },
          },
        },
      },
    }) as Promise<LeadSaleWithItems[]>
  }
}
