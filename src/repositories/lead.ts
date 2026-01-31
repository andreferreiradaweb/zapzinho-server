import { Prisma, Lead, LeadStatus, LeadOption } from '@/lib/prisma'


export interface LeadRepository {
  findLeadById(leadId: string): Promise<Lead | null>
  findLeadWhereUserByNumber(userId: string, number: string): Promise<Lead | null>
  countByUserId(
    userId: string,
    search: string,
    status?: LeadStatus,
    option?: LeadOption,
    startDate?: string,
    endDate?: string,
  ): Promise<number>
  filterManyByUserId(
    userId: string,
    offset: number,
    limit: number,
    search: string,
    status?: LeadStatus,
    option?: LeadOption,
    startDate?: string,
    endDate?: string,
  ): Promise<Lead[]>
  delete(id: string): Promise<Lead>
  create(data: Prisma.LeadUncheckedCreateInput): Promise<Lead>
  update(data: Prisma.LeadUncheckedUpdateInput): Promise<Lead>
}
