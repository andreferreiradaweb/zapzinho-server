import { FlowRepository, FlowStepData, FlowWithSteps } from '@/repositories/flow'
import { ResourceNotFound } from '@/error/resource-not-found'

interface Request {
  id: string
  userId: string
  name: string
  isActive: boolean
  step: FlowStepData
}

export class UpdateFlowUseCase {
  constructor(private flowRepository: FlowRepository) {}

  async execute(req: Request): Promise<FlowWithSteps> {
    const existing = await this.flowRepository.findById(req.id)
    if (!existing || existing.userId !== req.userId) throw new ResourceNotFound()
    return this.flowRepository.update(req)
  }
}
