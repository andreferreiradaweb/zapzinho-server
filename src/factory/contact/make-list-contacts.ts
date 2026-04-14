import { PrismaContactRepository } from '@/repositories/prisma/contact'
import { ListContactsUseCase } from '@/use-cases/contact/list-contacts'

export function makeListContacts() {
  return new ListContactsUseCase(new PrismaContactRepository())
}
