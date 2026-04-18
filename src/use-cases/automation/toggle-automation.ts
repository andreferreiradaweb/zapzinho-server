import { Automation } from '@/lib/prisma'
import { AutomationRepository } from '@/repositories/automation'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

export class ToggleAutomationUseCase {
  constructor(private automationRepository: AutomationRepository) {}

  async execute(id: string, userId: string, isActive: boolean): Promise<Automation> {
    const automation = await this.automationRepository.findById(id)
    if (!automation) throw new ResourceNotFound()
    if (automation.userId !== userId) throw new InvalidCredentialsError()
    return this.automationRepository.toggleActive(id, isActive)
  }
}
