import { PrismaContactListRepository } from '@/repositories/prisma/prospecting'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { MoveToLeadUseCase } from '@/use-cases/prospecting/move-to-lead'

export function makeMoveToLead() {
  return new MoveToLeadUseCase(
    new PrismaContactListRepository(),
    new PrismaLeadRepository(),
  )
}
