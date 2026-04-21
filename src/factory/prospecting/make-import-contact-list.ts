import { PrismaContactListRepository } from '@/repositories/prisma/prospecting'
import { ImportContactListUseCase } from '@/use-cases/prospecting/import-contact-list'

export function makeImportContactList() {
  return new ImportContactListUseCase(new PrismaContactListRepository())
}
