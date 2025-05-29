import { Prisma, Lead, LeadStatus, House, LeadType } from '@prisma/client'

export interface LeadWithHouse extends Lead {
  House: House
}
export interface LeadRepository {
  findLeadById(leadId: string): Promise<Lead | null>
  findManyByCompanyId(companyId: string): Promise<LeadWithHouse[] | []>
  filterManyByCompanyId(
    companyId: string,
    offset: number,
    limit: number,
    search: string,
    leadStatus?: LeadStatus,
    type?: LeadType,
    startDate?: string,
    endDate?: string,
  ): Promise<LeadWithHouse[] | []>
  countByCompanyId(
    companyId: string,
    search: string,
    status?: LeadStatus,
    type?: LeadType,
    startDate?: string,
    endDate?: string,
  ): Promise<number>
  delete(id: string): Promise<Lead>
  create(data: Prisma.LeadUncheckedCreateInput): Promise<Lead>
  update(data: Prisma.LeadUncheckedUpdateInput): Promise<Lead>
}
