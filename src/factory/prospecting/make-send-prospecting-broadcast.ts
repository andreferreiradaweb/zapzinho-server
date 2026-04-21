import { PrismaContactListRepository, PrismaProspectingBroadcastRepository } from '@/repositories/prisma/prospecting'
import { PrismaMessageLogRepository } from '@/repositories/prisma/message-log'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { SendProspectingBroadcastUseCase } from '@/use-cases/prospecting/send-prospecting-broadcast'

export function makeSendProspectingBroadcast() {
  return new SendProspectingBroadcastUseCase(
    new PrismaContactListRepository(),
    new PrismaProspectingBroadcastRepository(),
    new PrismaMessageLogRepository(),
    new PrismaUserRepository(),
  )
}
