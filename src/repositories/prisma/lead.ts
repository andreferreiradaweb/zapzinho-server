import { Prisma, LeadStatus, Product, Lead, LeadOption } from '@/lib/prisma'
import { LeadRepository } from '../lead'
import { prisma } from '@/lib/prisma'

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
    option?: LeadOption,
    startDate?: string,
    endDate?: string,
  ) {
    const where: Prisma.LeadWhereInput = {
      userId,
    }

    if (status) {
      where.Status = {
        equals: status,
      }
    }

    if (option) {
      where.Option = {
        equals: option,
      }
    }

    if (search) {
      where.productId = {
        equals: search,
      }
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const leads = await prisma.lead.findMany({
      where,
      skip: offset,
      take: Number(limit),
      include: {
        Product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return leads as LeadWithProduct[]
  }

  async countByUserId(
    userId: string,
    search: string,
    status: LeadStatus,
    option: LeadOption,
    startDate?: string,
    endDate?: string,
  ) {
    const where: Prisma.LeadWhereInput = {
      userId,
    }

    if (status) {
      where.Status = {
        equals: status,
      }
    }

    if (option) {
      where.Option = {
        equals: option,
      }
    }

    if (search) {
      where.productId = {
        equals: search,
      }
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    return prisma.lead.count({
      where,
    })
  }

  async delete(id: string) {
    return prisma.lead.delete({
      where: {
        id,
      },
    })
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
}
