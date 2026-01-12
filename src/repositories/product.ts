import { Prisma, Lead, Product } from '@/lib/prisma'

interface ProductWithLeads extends Product {
  Leads: Lead[]
}


export interface ProductRepository {
  findProductById(productId: string): Promise<ProductWithLeads | null>
  countByUserId(userId: string, search: string, startDate?: string, endDate?: string, limit?: number, offset?: number): Promise<number>
  filterManyByUserId(
    userId: string,
    offset: number,
    limit: number,
    search: string,
    startDate?: string,
    endDate?: string
  ): Promise<ProductWithLeads[] | []>
  create(data: Prisma.ProductUncheckedCreateInput): Promise<Product>
  update(data: Prisma.ProductUncheckedUpdateInput): Promise<Product>
  delete(id: string): Promise<Product>
}
