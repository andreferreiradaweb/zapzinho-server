import { PrismaBroadcastBlockRepository } from '@/repositories/prisma/broadcast-block'
import { AddBroadcastBlockUseCase } from '@/use-cases/broadcast-block/add-broadcast-block'

export function makeAddBroadcastBlock() {
  return new AddBroadcastBlockUseCase(new PrismaBroadcastBlockRepository())
}
