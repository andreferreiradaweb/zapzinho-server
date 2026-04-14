import { PrismaBroadcastRepository } from '@/repositories/prisma/broadcast'
import { GetBroadcastStatsUseCase } from '@/use-cases/broadcast/get-broadcast-stats'
export function makeGetBroadcastStats() {
  return new GetBroadcastStatsUseCase(new PrismaBroadcastRepository())
}
