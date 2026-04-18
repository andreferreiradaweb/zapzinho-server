import { PrismaAutomationRepository } from '@/repositories/prisma/automation'
import { ListAutomationsUseCase } from '@/use-cases/automation/list-automations'

export function makeListAutomations() {
  return new ListAutomationsUseCase(new PrismaAutomationRepository())
}
