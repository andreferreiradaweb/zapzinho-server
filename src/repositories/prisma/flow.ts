import { prisma } from '@/lib/prisma'
import {
  FlowRepository,
  FlowWithSteps,
  FlowSession,
  FlowStepData,
} from '@/repositories/flow'

export class PrismaFlowRepository implements FlowRepository {
  async create(data: {
    userId: string
    name: string
    step: FlowStepData
  }): Promise<FlowWithSteps> {
    const flow = await prisma.flow.create({
      data: {
        userId: data.userId,
        name: data.name,
        Steps: {
          create: {
            message: data.step.message,
            Options: {
              create: data.step.options.map((opt) => ({
                label: opt.label,
                trigger: opt.trigger,
                Actions: {
                  create: opt.actions.map((act) => ({
                    type: act.type,
                    payload: act.payload,
                    order: act.order,
                  })),
                },
              })),
            },
          },
        },
      },
      include: {
        Steps: { include: { Options: { include: { Actions: true } } } },
      },
    })
    return flow as FlowWithSteps
  }

  async findById(id: string): Promise<FlowWithSteps | null> {
    const flow = await prisma.flow.findUnique({
      where: { id },
      include: {
        Steps: { include: { Options: { include: { Actions: { orderBy: { order: 'asc' } } } } } },
      },
    })
    return flow as FlowWithSteps | null
  }

  async findByUserId(userId: string): Promise<FlowWithSteps[]> {
    const flows = await prisma.flow.findMany({
      where: { userId },
      include: {
        Steps: { include: { Options: { include: { Actions: { orderBy: { order: 'asc' } } } } } },
      },
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
    const existing = await prisma.flow.findUnique({
      where: { id: data.id },
      include: { Steps: true },
    })

    await prisma.$transaction(async (tx) => {
      if (existing?.Steps[0]) {
        await tx.flowStep.delete({ where: { id: existing.Steps[0].id } })
      }
      await tx.flow.update({
        where: { id: data.id },
        data: {
          name: data.name,
          isActive: data.isActive,
          Steps: {
            create: {
              message: data.step.message,
              Options: {
                create: data.step.options.map((opt) => ({
                  label: opt.label,
                  trigger: opt.trigger,
                  Actions: {
                    create: opt.actions.map((act) => ({
                      type: act.type,
                      payload: act.payload,
                      order: act.order,
                    })),
                  },
                })),
              },
            },
          },
        },
      })
    })

    return this.findById(data.id) as Promise<FlowWithSteps>
  }

  async delete(id: string): Promise<void> {
    await prisma.flow.delete({ where: { id } })
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

  async expireOldSessions(): Promise<void> {
    await prisma.flowSession.updateMany({
      where: { status: 'ACTIVE', expiresAt: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    })
  }
}
