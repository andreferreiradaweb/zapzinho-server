import { PrismaBroadcastRepository } from '@/repositories/prisma/broadcast'
import { DeleteBroadcastUseCase } from '@/use-cases/broadcast/delete-broadcast'
export function makeDeleteBroadcast() {
  return new DeleteBroadcastUseCase(new PrismaBroadcastRepository())
}
