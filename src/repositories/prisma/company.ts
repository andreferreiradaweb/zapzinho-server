import { Prisma } from '@prisma/client'
import { CompanyRepository } from '../company'
import { prisma } from '@/lib/prisma'

export class PrismaCompanyRepository implements CompanyRepository {
  async update(data: Prisma.CompanyUncheckedUpdateInput) {
    const company = await prisma.company.update({
      where: {
        id: String(data.id),
      },
      data,
    })
    return company
  }

  async delete(companyId: string) {
    const company = await prisma.company.delete({ where: { id: companyId } })
    return company
  }

  async listCompaniesByUserId(userId: string) {
    const companies = await prisma.company.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
    return companies || null
  }

  async findCompanyById(companyId: string) {
    const company = await prisma.company.findUnique({
      where: {
        id: companyId,
      },
    })
    return company || null
  }

  async create(data: Prisma.CompanyUncheckedCreateInput) {
    const company = await prisma.company.create({ data })
    return company
  }
}
