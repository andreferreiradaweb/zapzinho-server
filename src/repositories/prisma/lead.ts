import { Prisma, LeadStatus, House, LeadType, Lead } from '@prisma/client'
import { LeadRepository, LeadWithHouse } from '../lead'
import { prisma } from '@/lib/prisma'

export class PrismaLeadRepository implements LeadRepository {
  async findLeadById(leadId: string) {
    return prisma.lead.findUnique({
      where: {
        id: leadId,
      },
    })
  }

  async findManyByCompanyId(companyId: string) {
    const leads = await prisma.lead.findMany({
      where: {
        companyId,
      },
      include: {
        House: true,
      },
    })

    return leads as LeadWithHouse[]
  }

  async filterManyByCompanyId(
    companyId: string,
    offset: number,
    limit: number,
    search: string,
    status?: LeadStatus,
    type?: LeadType,
    startDate?: string,
    endDate?: string,
  ) {
    const where: Prisma.LeadWhereInput = {
      companyId,
    }

    if (status) {
      where.Status = {
        equals: status,
      }
    }

    if (type) {
      where.Type = {
        equals: type,
      }
    }

    if (search) {
      where.houseId = {
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
        House: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return leads as LeadWithHouse[]
  }

  async countByCompanyId(
    companyId: string,
    search: string,
    status: LeadStatus,
    type: LeadType,
    startDate?: string,
    endDate?: string,
  ) {
    const where: Prisma.LeadWhereInput = {
      companyId,
    }

    if (status) {
      where.Status = {
        equals: status,
      }
    }

    if (type) {
      where.Type = {
        equals: type,
      }
    }

    if (search) {
      where.houseId = {
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
