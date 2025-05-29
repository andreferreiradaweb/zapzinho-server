import { Prisma, Product } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { ProductRepository } from '../product'

export class PrismaProductRepository implements ProductRepository {
  async findManyByCompanyId(companyId: string) {
    const products = await prisma.product.findMany({
      where: {
        companyId,
      },
      include: {
        Leads: true,
      },
    })

    return products || null
  }
  async countByCompanyId(companyId: string, search: string,) {
    const where: Prisma.ProductWhereInput = {
      companyId,
      AND: [
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ],
        },
      ],
    };

    const count = await prisma.product.count({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });
    return count
  }

  async delete(productId: string) {
    const product = await prisma.product.delete({ where: { id: productId } })
    return product
  }

  async filterManyByCompanyId(
    companyId: string,
    offset: number,
    limit: number,
    search: string,
  ) {
    const where: Prisma.ProductWhereInput = {
      companyId,
      AND: [
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ],
        },
      ],
    };

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Leads: true,
      },
      skip: Number(offset),
      take: Number(limit),
    });

    return products || [];
  }

  async findProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
      include: {
        Leads: true,
      },
    })

    return product || null
  }

  async create(data: Prisma.ProductUncheckedCreateInput) {
    const product = await prisma.product.create({ data })
    return product
  }

  async update(data: Prisma.ProductUncheckedUpdateInput) {
    const product = await prisma.product.update({
      where: {
        id: String(data.id),
      },
      data,
    })
    return product
  }
}
