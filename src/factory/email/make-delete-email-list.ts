import { PrismaEmailListRepository } from '@/repositories/prisma/email'
import { DeleteEmailListUseCase } from '@/use-cases/email/delete-email-list'

export function makeDeleteEmailList() {
  return new DeleteEmailListUseCase(new PrismaEmailListRepository())
}
