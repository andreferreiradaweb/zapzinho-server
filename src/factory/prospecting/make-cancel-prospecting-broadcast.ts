import { PrismaProspectingBroadcastRepository } from '@/repositories/prisma/prospecting'
import { CancelProspectingBroadcastUseCase } from '@/use-cases/prospecting/cancel-prospecting-broadcast'

export function makeCancelProspectingBroadcast() {
  return new CancelProspectingBroadcastUseCase(
    new PrismaProspectingBroadcastRepository(),
  )
}
