import { FlowRepository } from '@/repositories/flow'
import { ResourceNotFound } from '@/error/resource-not-found'

export class DeleteFlowUseCase {
  constructor(private flowRepository: FlowRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const existing = await this.flowRepository.findById(id)
    if (!existing || existing.userId !== userId) throw new ResourceNotFound()
    await this.flowRepository.delete(id)
  }
}
