import { Automation } from '@/lib/prisma'
import { AutomationRepository } from '@/repositories/automation'

export class ListAutomationsUseCase {
  constructor(private automationRepository: AutomationRepository) {}

  async execute(userId: string): Promise<Automation[]> {
    return this.automationRepository.findAllByUserId(userId)
  }
}
