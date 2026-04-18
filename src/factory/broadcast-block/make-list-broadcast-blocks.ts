import { PrismaBroadcastBlockRepository } from '@/repositories/prisma/broadcast-block'
import { ListBroadcastBlocksUseCase } from '@/use-cases/broadcast-block/list-broadcast-blocks'

export function makeListBroadcastBlocks() {
  return new ListBroadcastBlocksUseCase(new PrismaBroadcastBlockRepository())
}
