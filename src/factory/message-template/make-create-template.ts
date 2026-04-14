import { PrismaMessageTemplateRepository } from '@/repositories/prisma/message-template'
import { CreateTemplateUseCase } from '@/use-cases/message-template/create-template'
export function makeCreateTemplate() {
  return new CreateTemplateUseCase(new PrismaMessageTemplateRepository())
}
