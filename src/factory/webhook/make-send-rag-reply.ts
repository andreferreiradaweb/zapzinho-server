import { PrismaMessageLogRepository } from '@/repositories/prisma/message-log'
import { SendRagReplyUseCase } from '@/use-cases/webhook/send-rag-reply'

export function makeSendRagReply() {
  return new SendRagReplyUseCase(new PrismaMessageLogRepository())
}
