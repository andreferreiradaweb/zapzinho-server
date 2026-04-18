import { BroadcastBlock, Lead } from '@/lib/prisma'

export type BroadcastBlockWithLead = BroadcastBlock & { Lead: Lead }

export interface BroadcastBlockRepository {
  findByUserId(userId: string, offset: number, limit: number): Promise<BroadcastBlockWithLead[]>
  countByUserId(userId: string): Promise<number>
  add(userId: string, leadId: string): Promise<BroadcastBlock>
  remove(userId: string, leadId: string): Promise<void>
  findBlockedLeadIds(userId: string): Promise<string[]>
}
