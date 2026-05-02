import { PrismaFlowRepository } from '@/repositories/prisma/flow'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { PrismaMessageLogRepository } from '@/repositories/prisma/message-log'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { ProcessFlowReplyUseCase } from '@/use-cases/flow/process-flow-reply'

export function ProcessFlowReplyFactory() {
  return new ProcessFlowReplyUseCase(
    new PrismaFlowRepository(),
    new PrismaLeadRepository(),
    new PrismaMessageLogRepository(),
    new PrismaUserRepository(),
  )
}
