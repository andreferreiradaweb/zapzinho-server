import { PrismaContactRepository } from '@/repositories/prisma/contact'
import { UpdateContactUseCase } from '@/use-cases/contact/update-contact'

export function makeUpdateContact() {
  return new UpdateContactUseCase(new PrismaContactRepository())
}
