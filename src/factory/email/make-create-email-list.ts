import { PrismaEmailListRepository } from '@/repositories/prisma/email'
import { CreateEmailListUseCase } from '@/use-cases/email/create-email-list'

export function makeCreateEmailList() {
  return new CreateEmailListUseCase(new PrismaEmailListRepository())
}
