import { BroadcastBlock } from '@/lib/prisma'

export interface BroadcastBlockRepository {
  findByUserId(userId: string, offset: number, limit: number): Promise<BroadcastBlock[]>
  countByUserId(userId: string): Promise<number>
  add(userId: string, phone: string): Promise<BroadcastBlock>
  remove(userId: string, id: string): Promise<void>
  findBlockedPhones(userId: string): Promise<string[]>
}
