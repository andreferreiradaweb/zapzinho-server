import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/prisma'
import {
  FlowRepository,
  FlowWithSteps,
  FlowSession,
  FlowStepData,
  FlowOptionData,
} from '@/repositories/flow'

// Fixed-depth nested include — supports up to 5 levels of sub-menus
const optionInclude = {
  Actions: { orderBy: { order: 'asc' as const } },
  NextStep: {
    include: {
      Options: {
        include: {
          Actions: { orderBy: { order: 'asc' as const } },
          NextStep: {
            include: {
              Options: {
                include: {
                  Actions: { orderBy: { order: 'asc' as const } },
                  NextStep: {
                    include: {
                      Options: {
                        include: {
                          Actions: { orderBy: { order: 'asc' as const } },
                          NextStep: {
                            include: {
                              Options: {
                                include: {
                                  Actions: { orderBy: { order: 'asc' as const } },
                                  NextStep: null,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}

const flowInclude = {
  Steps: { include: { Options: { include: optionInclude } } },
}

type PrismaTx = Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

async function createStepTree(
  tx: PrismaTx,
  flowId: string,
  stepData: FlowStepData,
): Promise<string> {
  const step = await tx.flowStep.create({
    data: {
      flowId,
      message: stepData.message,
      Options: {
        create: stepData.options.map((opt) => ({
          label: opt.label,
          trigger: opt.trigger,
          Actions: {
            create: opt.actions.map((act) => ({
              type: act.type,
              payload: act.payload as Prisma.InputJsonValue,
              order: act.order,
            })),
          },
        })),
      },
    },
    include: { Options: { select: { id: true } } },
  })

  for (let i = 0; i < stepData.options.length; i++) {
    const optData: FlowOptionData = stepData.options[i]
    if (optData.nextStep) {
      const nextStepId = await createStepTree(tx, flowId, optData.nextStep)
      await tx.flowOption.update({
        where: { id: step.Options[i].id },
        data: { nextStepId },
      })
    }
  }

  return step.id
}

export class PrismaFlowRepository implements FlowRepository {
  async create(data: {
    userId: string
    name: string
    step: FlowStepData
  }): Promise<FlowWithSteps> {
    const flow = await prisma.$transaction(async (tx) => {
      const created = await tx.flow.create({
        data: { userId: data.userId, name: data.name },
      })
      await createStepTree(tx as unknown as PrismaTx, created.id, data.step)
      return created.id
    })

    return this.findById(flow) as Promise<FlowWithSteps>
  }

  async findById(id: string): Promise<FlowWithSteps | null> {
    const flow = await prisma.flow.findUnique({
      where: { id },
      include: flowInclude,
    })
    return flow as FlowWithSteps | null
  }

  async findByUserId(userId: string): Promise<FlowWithSteps[]> {
    const flows = await prisma.flow.findMany({
      where: { userId },
      include: flowInclude,
      orderBy: { createdAt: 'desc' },
    })
    return flows as FlowWithSteps[]
  }

  async update(data: {
    id: string
    name: string
    isActive: boolean
    step: FlowStepData
  }): Promise<FlowWithSteps> {
    await prisma.$transaction(async (tx) => {
      // Null out all nextStepIds first to avoid FK constraint issues when deleting steps
      const existing = await tx.flow.findUnique({
        where: { id: data.id },
        include: { Steps: { include: { Options: { select: { id: true, nextStepId: true } } } } },
      })
      const optionIds = existing?.Steps.flatMap((s) =>
        s.Options.filter((o) => o.nextStepId !== null).map((o) => o.id),
      ) ?? []
      if (optionIds.length > 0) {
        await tx.flowOption.updateMany({
          where: { id: { in: optionIds } },
          data: { nextStepId: null },
        })
      }

      // Delete all existing steps (cascades to options and actions)
      await tx.flowStep.deleteMany({ where: { flowId: data.id } })

      // Update flow metadata
      await tx.flow.update({
        where: { id: data.id },
        data: { name: data.name, isActive: data.isActive },
      })

      // Recreate step tree
      await createStepTree(tx as unknown as PrismaTx, data.id, data.step)
    })

    return this.findById(data.id) as Promise<FlowWithSteps>
  }

  async delete(id: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.flow.findUnique({
        where: { id },
        include: { Steps: { include: { Options: { select: { id: true, nextStepId: true } } } } },
      })
      const optionIds = existing?.Steps.flatMap((s) =>
        s.Options.filter((o) => o.nextStepId !== null).map((o) => o.id),
      ) ?? []
      if (optionIds.length > 0) {
        await tx.flowOption.updateMany({
          where: { id: { in: optionIds } },
          data: { nextStepId: null },
        })
      }
      await tx.flow.delete({ where: { id } })
    })
  }

  async createSession(data: {
    flowId: string
    stepId: string
    userId: string
    phone: string
    expiresAt: Date
  }): Promise<FlowSession> {
    return prisma.flowSession.create({ data })
  }

  async findActiveSession(userId: string, phone: string): Promise<FlowSession | null> {
    return prisma.flowSession.findFirst({
      where: {
        userId,
        phone,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async completeSession(id: string): Promise<void> {
    await prisma.flowSession.update({
      where: { id },
      data: { status: 'COMPLETED' },
    })
  }

  async advanceSession(id: string, nextStepId: string): Promise<void> {
    await prisma.flowSession.update({
      where: { id },
      data: { stepId: nextStepId },
    })
  }

  async expireOldSessions(): Promise<void> {
    await prisma.flowSession.updateMany({
      where: { status: 'ACTIVE', expiresAt: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    })
  }
}
