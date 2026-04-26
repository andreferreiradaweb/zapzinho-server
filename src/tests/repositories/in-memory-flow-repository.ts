import { v4 as uuid } from 'uuid'
import {
  FlowRepository,
  FlowWithSteps,
  FlowSession,
  FlowStepData,
  FlowStepItem,
  FlowOptionItem,
} from '@/repositories/flow'

function buildStepItem(stepData: FlowStepData): FlowStepItem {
  return {
    id: uuid(),
    message: stepData.message,
    Options: stepData.options.map((opt): FlowOptionItem => ({
      id: uuid(),
      label: opt.label,
      trigger: opt.trigger,
      Actions: opt.actions.map((act) => ({
        id: uuid(),
        type: act.type,
        payload: act.payload,
        order: act.order,
      })),
      NextStep: opt.nextStep ? buildStepItem(opt.nextStep) : null,
    })),
  }
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

export class InMemoryFlowRepository implements FlowRepository {
  public items: FlowWithSteps[] = []
  public sessions: FlowSession[] = []

  async create(data: {
    userId: string
    name: string
    step: FlowStepData
  }): Promise<FlowWithSteps> {
    const rootStep = buildStepItem(data.step)
    const flow: FlowWithSteps = {
      id: uuid(),
      userId: data.userId,
      name: data.name,
      isActive: true,
      createdAt: new Date(),
      Steps: [rootStep],
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
    const rootStep = buildStepItem(data.step)
    this.items[idx] = {
      ...this.items[idx],
      name: data.name,
      isActive: data.isActive,
      Steps: [rootStep],
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

  async advanceSession(id: string, nextStepId: string): Promise<void> {
    const s = this.sessions.find((s) => s.id === id)
    if (s) s.stepId = nextStepId
  }

  async expireOldSessions(): Promise<void> {
    this.sessions.forEach((s) => {
      if (s.status === 'ACTIVE' && s.expiresAt < new Date()) s.status = 'EXPIRED'
    })
  }

  // Helper for tests: find any step by id in all flows
  findStepInFlows(stepId: string): FlowStepItem | null {
    for (const flow of this.items) {
      const found = findStepById(flow.Steps, stepId)
      if (found) return found
    }
    return null
  }
}
