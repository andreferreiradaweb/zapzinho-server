import { FlowRepository } from '@/repositories/flow'
import { LeadRepository } from '@/repositories/lead'
import { MessageLogRepository } from '@/repositories/message-log'
import { sendWhatsAppMessage } from '@/services/wapi'
import { FlowActionType } from '@/repositories/flow'

interface Request {
  userId: string
  phone: string
  message: string
}

export class ProcessFlowReplyUseCase {
  constructor(
    private flowRepository: FlowRepository,
    private leadRepository: LeadRepository,
    private messageLogRepository: MessageLogRepository,
  ) {}

  async execute(req: Request): Promise<boolean> {
    const session = await this.flowRepository.findActiveSession(req.userId, req.phone)
    if (!session) return false

    const flow = await this.flowRepository.findById(session.flowId)
    if (!flow) return false

    const step = flow.Steps.find((s) => s.id === session.stepId)
    if (!step) return false

    const normalized = req.message.trim().toLowerCase()
    const matchedOption = step.Options.find(
      (o) => o.trigger.toLowerCase() === normalized,
    )

    if (!matchedOption) return false

    await this.flowRepository.completeSession(session.id)

    const lead = await this.leadRepository.findLeadWhereUserByNumber(req.userId, req.phone)

    const sortedActions = [...matchedOption.Actions].sort((a, b) => a.order - b.order)

    for (const action of sortedActions) {
      if (action.type === FlowActionType.SEND_MESSAGE) {
        const msg = (action.payload as { message: string }).message
        if (msg) {
          await sendWhatsAppMessage({ phone: req.phone, message: msg })
          await this.messageLogRepository.create({
            userId: req.userId,
            leadId: lead?.id ?? null,
            phone: req.phone,
            message: msg,
            type: 'FLOW',
          })
        }
      } else if (action.type === FlowActionType.UPDATE_LEAD_STATUS && lead) {
        const status = (action.payload as { status: string }).status
        if (status) {
          await this.leadRepository.update({
            id: lead.id,
            Status: status as never,
          })
        }
      } else if (action.type === FlowActionType.ASSIGN_CATEGORY && lead) {
        const categoryId = (action.payload as { categoryId: string }).categoryId
        if (categoryId) {
          await this.leadRepository.update({
            id: lead.id,
            categoryId,
          })
        }
      }
    }

    return true
  }
}
