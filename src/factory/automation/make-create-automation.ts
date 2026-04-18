import { PrismaAutomationRepository } from '@/repositories/prisma/automation'
import { CreateAutomationUseCase } from '@/use-cases/automation/create-automation'

export function makeCreateAutomation() {
  return new CreateAutomationUseCase(new PrismaAutomationRepository())
}
