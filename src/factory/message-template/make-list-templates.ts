import { PrismaMessageTemplateRepository } from '@/repositories/prisma/message-template'
import { ListTemplatesUseCase } from '@/use-cases/message-template/list-templates'
export function makeListTemplates() {
  return new ListTemplatesUseCase(new PrismaMessageTemplateRepository())
}
