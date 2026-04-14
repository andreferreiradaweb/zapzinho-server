import { MessageLog, MessageType, Prisma } from '@/lib/prisma'

export interface MessageLogRepository {
  create(data: Prisma.MessageLogUncheckedCreateInput): Promise<MessageLog>
  findAllByUserId(userId: string, offset: number, limit: number, type?: MessageType): Promise<MessageLog[]>
  countByUserId(userId: string, type?: MessageType): Promise<number>
  markSent(id: string): Promise<void>
  markFailed(id: string, errorMsg: string): Promise<void>
}
