import { PrismaFlowRepository } from '@/repositories/prisma/flow'
import { CreateFlowUseCase } from '@/use-cases/flow/create-flow'

export function CreateFlowFactory() {
  return new CreateFlowUseCase(new PrismaFlowRepository())
}
