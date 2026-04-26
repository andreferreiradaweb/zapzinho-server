import { PrismaFlowRepository } from '@/repositories/prisma/flow'
import { ListFlowsUseCase } from '@/use-cases/flow/list-flows'

export function ListFlowsFactory() {
  return new ListFlowsUseCase(new PrismaFlowRepository())
}
