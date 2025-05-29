import { Prisma, Company } from '@prisma/client'

export interface CompanyRepository {
  listCompaniesByUserId(userId: string): Promise<Company[] | null>
  findCompanyById(companyId: string): Promise<Company | null>
  create(data: Prisma.CompanyUncheckedCreateInput): Promise<Company>
  update(data: Prisma.CompanyUncheckedUpdateInput): Promise<Company>
  delete(companyId: string): Promise<Company>
}
