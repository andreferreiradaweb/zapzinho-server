import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { CreateLeadFromWhatsappUseCase } from '@/use-cases/lead/create-lead-from-whatsapp'

export function CreateLeadFromWhatsappFactory() {
  const leadRepository = new PrismaLeadRepository()
  const userRepository = new PrismaUserRepository()
  return new CreateLeadFromWhatsappUseCase(leadRepository, userRepository)
}
