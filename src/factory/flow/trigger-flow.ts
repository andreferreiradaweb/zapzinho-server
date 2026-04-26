import { PrismaFlowRepository } from '@/repositories/prisma/flow'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { PrismaMessageLogRepository } from '@/repositories/prisma/message-log'
import { TriggerFlowUseCase } from '@/use-cases/flow/trigger-flow'

export function TriggerFlowFactory() {
  return new TriggerFlowUseCase(
    new PrismaFlowRepository(),
    new PrismaLeadRepository(),
    new PrismaMessageLogRepository(),
  )
}
