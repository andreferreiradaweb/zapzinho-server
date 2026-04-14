import { PrismaContactRepository } from '@/repositories/prisma/contact'
import { ImportContactsUseCase } from '@/use-cases/contact/import-contacts'

export function makeImportContacts() {
  return new ImportContactsUseCase(new PrismaContactRepository())
}
