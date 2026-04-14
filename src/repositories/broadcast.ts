import { Broadcast, BroadcastLead, BroadcastStatus, Prisma } from '@/lib/prisma'

export interface BroadcastWithLeads extends Broadcast {
  BroadcastLeads: BroadcastLead[]
}

export interface BroadcastRepository {
  findById(id: string): Promise<BroadcastWithLeads | null>
  findAllByUserId(userId: string, offset: number, limit: number): Promise<Broadcast[]>
  countByUserId(userId: string): Promise<number>
  create(data: Prisma.BroadcastUncheckedCreateInput): Promise<Broadcast>
  addLeads(broadcastId: string, leadIds: string[]): Promise<void>
  updateStatus(id: string, status: BroadcastStatus, extra?: Partial<Broadcast>): Promise<Broadcast>
  updateLeadStatus(
    broadcastLeadId: string,
    status: 'SENT' | 'FAILED',
    errorMsg?: string,
  ): Promise<void>
  incrementSentCount(id: string, field: 'totalSent' | 'totalFailed'): Promise<void>
  delete(id: string): Promise<Broadcast>
}
