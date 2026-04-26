import { FlowRepository, FlowStepItem } from '@/repositories/flow'
import { LeadRepository } from '@/repositories/lead'
import { MessageLogRepository } from '@/repositories/message-log'
import { sendWhatsAppMessage, sendWhatsAppImage } from '@/services/wapi'
import { FlowActionType } from '@/repositories/flow'
import { prisma } from '@/lib/prisma'

interface Request {
  userId: string
  phone: string
  message: string
}

function findStepById(steps: FlowStepItem[], id: string): FlowStepItem | null {
  for (const step of steps) {
    if (step.id === id) return step
    for (const opt of step.Options) {
      if (opt.NextStep) {
        const found = findStepById([opt.NextStep], id)
        if (found) return found
      }
    }
  }
  return null
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

    const step = findStepById(flow.Steps, session.stepId)
    if (!step) return false

    const normalized = req.message.trim().toLowerCase()
    const matchedOption = step.Options.find(
      (o) => o.trigger.toLowerCase() === normalized,
    )
    if (!matchedOption) return false

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
      } else if (action.type === FlowActionType.SEND_IMAGE) {
        const { imageUrl, caption } = action.payload as { imageUrl: string; caption?: string }
        if (imageUrl) {
          await sendWhatsAppImage({ phone: req.phone, imageUrl, caption })
          await this.messageLogRepository.create({
            userId: req.userId,
            leadId: lead?.id ?? null,
            phone: req.phone,
            message: caption ?? imageUrl,
            type: 'FLOW',
          })
        }
      } else if (action.type === FlowActionType.SEND_TEMPLATE) {
        const { templateId } = action.payload as { templateId: string }
        if (templateId) {
          const template = await prisma.messageTemplate.findUnique({ where: { id: templateId } })
          if (template) {
            if (template.imageUrl) {
              await sendWhatsAppImage({
                phone: req.phone,
                imageUrl: template.imageUrl,
                caption: template.content,
              })
            } else {
              await sendWhatsAppMessage({ phone: req.phone, message: template.content })
            }
            await this.messageLogRepository.create({
              userId: req.userId,
              leadId: lead?.id ?? null,
              phone: req.phone,
              message: template.content,
              type: 'FLOW',
            })
          }
        }
      } else if (action.type === FlowActionType.SEND_PRODUCT) {
        const { productId } = action.payload as { productId: string }
        if (productId) {
          const product = await prisma.product.findUnique({ where: { id: productId } })
          if (product) {
            const lines = [`*${product.title}*`]
            if (product.description) lines.push(product.description)
            if (product.price) lines.push(`Preço: R$ ${product.price}`)
            if (product.code) lines.push(`Código: ${product.code}`)
            const msg = lines.join('\n')
            if (product.photos?.[0]) {
              await sendWhatsAppImage({ phone: req.phone, imageUrl: product.photos[0], caption: msg })
            } else {
              await sendWhatsAppMessage({ phone: req.phone, message: msg })
            }
            await this.messageLogRepository.create({
              userId: req.userId,
              leadId: lead?.id ?? null,
              phone: req.phone,
              message: msg,
              type: 'FLOW',
            })
          }
        }
      } else if (action.type === FlowActionType.UPDATE_LEAD_STATUS && lead) {
        const status = (action.payload as { status: string }).status
        if (status) {
          await this.leadRepository.update({ id: lead.id, Status: status as never })
        }
      } else if (action.type === FlowActionType.ASSIGN_CATEGORY && lead) {
        const categoryId = (action.payload as { categoryId: string }).categoryId
        if (categoryId) {
          await this.leadRepository.update({ id: lead.id, categoryId })
        }
      }
    }

    // Advance session to next step, or complete it
    if (matchedOption.NextStep) {
      await this.flowRepository.advanceSession(session.id, matchedOption.NextStep.id)
      await sendWhatsAppMessage({ phone: req.phone, message: matchedOption.NextStep.message })
      await this.messageLogRepository.create({
        userId: req.userId,
        leadId: lead?.id ?? null,
        phone: req.phone,
        message: matchedOption.NextStep.message,
        type: 'FLOW',
      })
    } else {
      await this.flowRepository.completeSession(session.id)
    }

    return true
  }
}
