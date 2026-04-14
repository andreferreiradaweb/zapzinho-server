import { PrismaContactRepository } from '@/repositories/prisma/contact'
import { DeleteContactUseCase } from '@/use-cases/contact/delete-contact'

export function makeDeleteContact() {
  return new DeleteContactUseCase(new PrismaContactRepository())
}
