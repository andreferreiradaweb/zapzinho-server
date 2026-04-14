import { PrismaContactRepository } from '@/repositories/prisma/contact'
import { CreateContactUseCase } from '@/use-cases/contact/create-contact'

export function makeCreateContact() {
  return new CreateContactUseCase(new PrismaContactRepository())
}
