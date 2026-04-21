import { PrismaContactListRepository } from '@/repositories/prisma/prospecting'
import { GetContactListUseCase } from '@/use-cases/prospecting/get-contact-list'

export function makeGetContactList() {
  return new GetContactListUseCase(new PrismaContactListRepository())
}
