import { PrismaAutomationRepository } from '@/repositories/prisma/automation'
import { ToggleAutomationUseCase } from '@/use-cases/automation/toggle-automation'

export function makeToggleAutomation() {
  return new ToggleAutomationUseCase(new PrismaAutomationRepository())
}
