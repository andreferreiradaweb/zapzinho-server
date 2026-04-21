import { PrismaContactListRepository } from '@/repositories/prisma/prospecting'
import { ListContactListsUseCase } from '@/use-cases/prospecting/list-contact-lists'

export function makeListContactLists() {
  return new ListContactListsUseCase(new PrismaContactListRepository())
}
