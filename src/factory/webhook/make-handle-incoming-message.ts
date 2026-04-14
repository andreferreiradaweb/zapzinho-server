import { PrismaUserRepository } from '@/repositories/prisma/user'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { HandleIncomingMessageUseCase } from '@/use-cases/webhook/handle-incoming-message'

export function makeHandleIncomingMessage() {
  return new HandleIncomingMessageUseCase(
    new PrismaUserRepository(),
    new PrismaLeadRepository(),
  )
}
