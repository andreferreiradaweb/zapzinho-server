import { prisma } from '@/lib/prisma'
import { LeadSaleRepository, LeadSaleItemInput, LeadSaleWithItems } from '../lead-sale'

export class PrismaLeadSaleRepository implements LeadSaleRepository {
  async create(data: {
    id: string
    leadId: string
    userId: string
    discount: number
    items: LeadSaleItemInput[]
  }) {
    return prisma.leadSale.create({
      data: {
        id: data.id,
        leadId: data.leadId,
        userId: data.userId,
        discount: data.discount,
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
            Product: { select: { title: true, price: true, costPrice: true } },
          },
        },
      },
    }) as Promise<LeadSaleWithItems[]>
  }

  async findById(id: string): Promise<LeadSaleWithItems | null> {
    return prisma.leadSale.findUnique({
      where: { id },
      include: {
        Items: {
          include: {
            Product: { select: { title: true, price: true, costPrice: true } },
          },
        },
      },
    }) as Promise<LeadSaleWithItems | null>
  }

  async update(data: {
    id: string
    userId: string
    discount: number
    items: LeadSaleItemInput[]
  }): Promise<LeadSaleWithItems> {
    return prisma.$transaction(async (tx) => {
      await tx.leadSaleItem.deleteMany({ where: { saleId: data.id } })
      return tx.leadSale.update({
        where: { id: data.id, userId: data.userId },
        data: {
          discount: data.discount,
          Items: {
            create: data.items.map((item) => ({
              id: require('crypto').randomUUID(),
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          Items: {
            include: {
              Product: { select: { title: true, price: true, costPrice: true } },
            },
          },
        },
      })
    }) as Promise<LeadSaleWithItems>
  }
}
