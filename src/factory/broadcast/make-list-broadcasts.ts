import { PrismaBroadcastRepository } from '@/repositories/prisma/broadcast'
import { ListBroadcastsUseCase } from '@/use-cases/broadcast/list-broadcasts'
export function makeListBroadcasts() {
  return new ListBroadcastsUseCase(new PrismaBroadcastRepository())
}
