import { PrismaFlowRepository } from '@/repositories/prisma/flow'
import { DeleteFlowUseCase } from '@/use-cases/flow/delete-flow'

export function DeleteFlowFactory() {
  return new DeleteFlowUseCase(new PrismaFlowRepository())
}
