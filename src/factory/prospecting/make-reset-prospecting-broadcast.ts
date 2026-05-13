import { PrismaContactListRepository, PrismaProspectingBroadcastRepository } from '@/repositories/prisma/prospecting'
import { ResetProspectingBroadcastUseCase } from '@/use-cases/prospecting/reset-prospecting-broadcast'

export function makeResetProspectingBroadcast() {
  return new ResetProspectingBroadcastUseCase(
    new PrismaProspectingBroadcastRepository(),
    new PrismaContactListRepository(),
  )
}
