import { Prisma, Lead, Product } from '@prisma/client'

interface ProductWithLeads extends Product {
  Leads: Lead[]
}


export interface ProductRepository {
  countByCompanyId(companyId: string, search: string, startDate?: string, endDate?: string, limit?: number, offset?: number): Promise<number>
  delete(id: string): Promise<Product>
  filterManyByCompanyId(
    companyId: string,
    offset: number,
    limit: number,
    search: string,
    startDate?: string,
    endDate?: string
  ): Promise<ProductWithLeads[] | []>
  findManyByCompanyId(
    companyId: string,
  ): Promise<Product[] | []>
  findProductById(productId: string): Promise<ProductWithLeads | null>
  create(data: Prisma.ProductUncheckedCreateInput): Promise<Product>
  update(data: Prisma.ProductUncheckedUpdateInput): Promise<Product>
}
