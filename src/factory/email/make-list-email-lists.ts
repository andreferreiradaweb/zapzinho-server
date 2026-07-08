import { PrismaEmailListRepository } from '@/repositories/prisma/email'
import { ListEmailListsUseCase } from '@/use-cases/email/list-email-lists'

export function makeListEmailLists() {
  return new ListEmailListsUseCase(new PrismaEmailListRepository())
}
