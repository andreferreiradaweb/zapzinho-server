import { PrismaBroadcastBlockRepository } from '@/repositories/prisma/broadcast-block'
import { RemoveBroadcastBlockUseCase } from '@/use-cases/broadcast-block/remove-broadcast-block'

export function makeRemoveBroadcastBlock() {
  return new RemoveBroadcastBlockUseCase(new PrismaBroadcastBlockRepository())
}
