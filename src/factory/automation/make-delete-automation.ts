import { PrismaAutomationRepository } from '@/repositories/prisma/automation'
import { DeleteAutomationUseCase } from '@/use-cases/automation/delete-automation'

export function makeDeleteAutomation() {
  return new DeleteAutomationUseCase(new PrismaAutomationRepository())
}
