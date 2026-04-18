import { PrismaBroadcastRepository } from '@/repositories/prisma/broadcast'
import { PrismaMessageLogRepository } from '@/repositories/prisma/message-log'
import { PrismaBroadcastBlockRepository } from '@/repositories/prisma/broadcast-block'
import { SendBroadcastUseCase } from '@/use-cases/broadcast/send-broadcast'
export function makeSendBroadcast() {
  return new SendBroadcastUseCase(
    new PrismaBroadcastRepository(),
    new PrismaMessageLogRepository(),
    new PrismaBroadcastBlockRepository(),
  )
}
