import { PrismaFlowRepository } from '@/repositories/prisma/flow'
import { UpdateFlowUseCase } from '@/use-cases/flow/update-flow'

export function UpdateFlowFactory() {
  return new UpdateFlowUseCase(new PrismaFlowRepository())
}
