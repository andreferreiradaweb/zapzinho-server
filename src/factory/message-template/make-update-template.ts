import { PrismaMessageTemplateRepository } from '@/repositories/prisma/message-template'
import { UpdateTemplateUseCase } from '@/use-cases/message-template/update-template'
export function makeUpdateTemplate() {
  return new UpdateTemplateUseCase(new PrismaMessageTemplateRepository())
}
