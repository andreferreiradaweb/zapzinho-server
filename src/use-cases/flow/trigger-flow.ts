import { FlowRepository, FlowWithSteps } from '@/repositories/flow'
import { LeadRepository } from '@/repositories/lead'
import { MessageLogRepository } from '@/repositories/message-log'
import { ResourceNotFound } from '@/error/resource-not-found'
import { sendWhatsAppMessage } from '@/services/wapi'

const SESSION_TTL_MINUTES = 30

interface Request {
  flowId: string
  leadId: string
  userId: string
}

interface Response {
  flow: FlowWithSteps
  sessionId: string
}

export class TriggerFlowUseCase {
  constructor(
    private flowRepository: FlowRepository,
    private leadRepository: LeadRepository,
    private messageLogRepository: MessageLogRepository,
  ) {}

  async execute(req: Request): Promise<Response> {
    const flow = await this.flowRepository.findById(req.flowId)
    if (!flow || flow.userId !== req.userId || !flow.isActive) throw new ResourceNotFound()

    const lead = await this.leadRepository.findLeadById(req.leadId)
    if (!lead || lead.userId !== req.userId) throw new ResourceNotFound()

    const step = flow.Steps[0]
    if (!step) throw new ResourceNotFound()

    await sendWhatsAppMessage({ phone: lead.telefone, message: step.message })

    await this.messageLogRepository.create({
      userId: req.userId,
      leadId: req.leadId,
      phone: lead.telefone,
      message: step.message,
      type: 'FLOW',
    })

    const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000)
    const session = await this.flowRepository.createSession({
      flowId: flow.id,
      stepId: step.id,
      userId: req.userId,
      phone: lead.telefone,
      expiresAt,
    })

    return { flow, sessionId: session.id }
  }
}
