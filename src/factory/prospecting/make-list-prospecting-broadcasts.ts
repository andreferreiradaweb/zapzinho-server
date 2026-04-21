import { PrismaProspectingBroadcastRepository } from '@/repositories/prisma/prospecting'
import { ListProspectingBroadcastsUseCase } from '@/use-cases/prospecting/list-prospecting-broadcasts'

export function makeListProspectingBroadcasts() {
  return new ListProspectingBroadcastsUseCase(new PrismaProspectingBroadcastRepository())
}
