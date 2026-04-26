import { FlowRepository, FlowStepData, FlowWithSteps } from '@/repositories/flow'

interface Request {
  userId: string
  name: string
  step: FlowStepData
}

export class CreateFlowUseCase {
  constructor(private flowRepository: FlowRepository) {}

  async execute(req: Request): Promise<FlowWithSteps> {
    return this.flowRepository.create(req)
  }
}
