import { v4 as uuid } from 'uuid'
import {
  FlowRepository,
  FlowWithSteps,
  FlowSession,
  FlowStepData,
} from '@/repositories/flow'

export class InMemoryFlowRepository implements FlowRepository {
  public items: FlowWithSteps[] = []
  public sessions: FlowSession[] = []

  async create(data: {
    userId: string
    name: string
    step: FlowStepData
  }): Promise<FlowWithSteps> {
    const stepId = uuid()
    const flow: FlowWithSteps = {
      id: uuid(),
      userId: data.userId,
      name: data.name,
      isActive: true,
      createdAt: new Date(),
      Steps: [
        {
          id: stepId,
          message: data.step.message,
          Options: data.step.options.map((opt) => ({
            id: uuid(),
            label: opt.label,
            trigger: opt.trigger,
            Actions: opt.actions.map((act) => ({
              id: uuid(),
              type: act.type,
              payload: act.payload,
              order: act.order,
            })),
          })),
        },
      ],
    }
    this.items.push(flow)
    return flow
  }

  async findById(id: string): Promise<FlowWithSteps | null> {
    return this.items.find((f) => f.id === id) ?? null
  }

  async findByUserId(userId: string): Promise<FlowWithSteps[]> {
    return this.items.filter((f) => f.userId === userId)
  }

  async update(data: {
    id: string
    name: string
    isActive: boolean
    step: FlowStepData
  }): Promise<FlowWithSteps> {
    const idx = this.items.findIndex((f) => f.id === data.id)
    if (idx === -1) throw new Error('Flow not found')
    const stepId = uuid()
    this.items[idx] = {
      ...this.items[idx],
      name: data.name,
      isActive: data.isActive,
      Steps: [
        {
          id: stepId,
          message: data.step.message,
          Options: data.step.options.map((opt) => ({
            id: uuid(),
            label: opt.label,
            trigger: opt.trigger,
            Actions: opt.actions.map((act) => ({
              id: uuid(),
              type: act.type,
              payload: act.payload,
              order: act.order,
            })),
          })),
        },
      ],
    }
    return this.items[idx]
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((f) => f.id !== id)
  }

  async createSession(data: {
    flowId: string
    stepId: string
    userId: string
    phone: string
    expiresAt: Date
  }): Promise<FlowSession> {
    const session: FlowSession = {
      id: uuid(),
      flowId: data.flowId,
      stepId: data.stepId,
      userId: data.userId,
      phone: data.phone,
      status: 'ACTIVE',
      createdAt: new Date(),
      expiresAt: data.expiresAt,
    }
    this.sessions.push(session)
    return session
  }

  async findActiveSession(userId: string, phone: string): Promise<FlowSession | null> {
    return (
      this.sessions.find(
        (s) =>
          s.userId === userId &&
          s.phone === phone &&
          s.status === 'ACTIVE' &&
          s.expiresAt > new Date(),
      ) ?? null
    )
  }

  async completeSession(id: string): Promise<void> {
    const s = this.sessions.find((s) => s.id === id)
    if (s) s.status = 'COMPLETED'
  }

  async expireOldSessions(): Promise<void> {
    this.sessions.forEach((s) => {
      if (s.status === 'ACTIVE' && s.expiresAt < new Date()) s.status = 'EXPIRED'
    })
  }
}
