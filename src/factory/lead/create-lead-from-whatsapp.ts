import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { PrismaMessageLogRepository } from '@/repositories/prisma/message-log'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { CreateLeadFromWhatsappUseCase } from '@/use-cases/lead/create-lead-from-whatsapp'

export function CreateLeadFromWhatsappFactory() {
  const leadRepository = new PrismaLeadRepository()
  const userRepository = new PrismaUserRepository()
  const messageLogRepository = new PrismaMessageLogRepository()
  return new CreateLeadFromWhatsappUseCase(leadRepository, userRepository, messageLogRepository)
}
