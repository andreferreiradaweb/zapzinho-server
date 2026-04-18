import { Prisma, ProductCategory } from '@/lib/prisma'

export interface ProductCategoryRepository {
  create(data: Prisma.ProductCategoryUncheckedCreateInput): Promise<ProductCategory>
  findById(id: string): Promise<ProductCategory | null>
  listByUserId(userId: string): Promise<ProductCategory[]>
  update(data: Prisma.ProductCategoryUncheckedUpdateInput): Promise<ProductCategory>
  delete(id: string): Promise<ProductCategory>
}
