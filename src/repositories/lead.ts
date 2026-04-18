import { Prisma, Lead, LeadStatus } from '@/lib/prisma'


export interface LeadRepository {
  findLeadById(leadId: string): Promise<Lead | null>
  findLeadWhereUserByNumber(userId: string, number: string): Promise<Lead | null>
  countByUserId(
    userId: string,
    search: string,
    status?: LeadStatus,
    startDate?: string,
    endDate?: string,
    phone?: string,
    productId?: string,
    categoryId?: string,
  ): Promise<number>
  filterManyByUserId(
    userId: string,
    offset: number,
    limit: number,
    search: string,
    status?: LeadStatus,
    startDate?: string,
    endDate?: string,
    phone?: string,
    productId?: string,
    categoryId?: string,
  ): Promise<Lead[]>
  delete(id: string): Promise<Lead>
  create(data: Prisma.LeadUncheckedCreateInput): Promise<Lead>
  update(data: Prisma.LeadUncheckedUpdateInput): Promise<Lead>
  findAllForBroadcast(userId: string, productId?: string, status?: LeadStatus, lastMessageRange?: string, lastBroadcastRange?: string, categoryId?: string): Promise<Lead[]>
}
