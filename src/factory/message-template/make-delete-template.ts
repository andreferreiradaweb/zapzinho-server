import { PrismaMessageTemplateRepository } from '@/repositories/prisma/message-template'
import { DeleteTemplateUseCase } from '@/use-cases/message-template/delete-template'
export function makeDeleteTemplate() {
  return new DeleteTemplateUseCase(new PrismaMessageTemplateRepository())
}
