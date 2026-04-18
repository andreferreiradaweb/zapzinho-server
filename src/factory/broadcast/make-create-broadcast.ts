import { PrismaBroadcastRepository } from '@/repositories/prisma/broadcast'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { PrismaBroadcastBlockRepository } from '@/repositories/prisma/broadcast-block'
import { CreateBroadcastUseCase } from '@/use-cases/broadcast/create-broadcast'
export function makeCreateBroadcast() {
  return new CreateBroadcastUseCase(
    new PrismaBroadcastRepository(),
    new PrismaLeadRepository(),
    new PrismaBroadcastBlockRepository(),
  )
}
