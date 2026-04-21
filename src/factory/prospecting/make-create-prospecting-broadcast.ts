import { PrismaContactListRepository, PrismaProspectingBroadcastRepository } from '@/repositories/prisma/prospecting'
import { CreateProspectingBroadcastUseCase } from '@/use-cases/prospecting/create-prospecting-broadcast'

export function makeCreateProspectingBroadcast() {
  return new CreateProspectingBroadcastUseCase(
    new PrismaContactListRepository(),
    new PrismaProspectingBroadcastRepository(),
  )
}
