import { FlowRepository, FlowWithSteps } from '@/repositories/flow'

export class ListFlowsUseCase {
  constructor(private flowRepository: FlowRepository) {}

  async execute(userId: string): Promise<FlowWithSteps[]> {
    return this.flowRepository.findByUserId(userId)
  }
}
