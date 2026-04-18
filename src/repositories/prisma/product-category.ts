import { Prisma } from '@/lib/prisma'
import { prisma } from '@/lib/prisma'
import { ProductCategoryRepository } from '../product-category'

export class PrismaProductCategoryRepository implements ProductCategoryRepository {
  async create(data: Prisma.ProductCategoryUncheckedCreateInput) {
    return prisma.productCategory.create({ data })
  }

  async findById(id: string) {
    return prisma.productCategory.findUnique({ where: { id } })
  }

  async listByUserId(userId: string) {
    return prisma.productCategory.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    })
  }

  async update(data: Prisma.ProductCategoryUncheckedUpdateInput) {
    return prisma.productCategory.update({
      where: { id: String(data.id) },
      data,
    })
  }

  async delete(id: string) {
    return prisma.productCategory.delete({ where: { id } })
  }
}
