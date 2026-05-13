import { PrismaProspectingBroadcastRepository } from '@/repositories/prisma/prospecting'
import { GetProspectingBroadcastStatusUseCase } from '@/use-cases/prospecting/get-prospecting-broadcast-status'

export function makeGetProspectingBroadcastStatus() {
  return new GetProspectingBroadcastStatusUseCase(new PrismaProspectingBroadcastRepository())
}
