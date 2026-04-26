import { FlowActionType, FlowSessionStatus } from '@/lib/prisma'

export { FlowActionType, FlowSessionStatus }

export interface FlowActionData {
  type: FlowActionType
  payload: Record<string, unknown>
  order: number
}

export interface FlowOptionData {
  label: string
  trigger: string
  actions: FlowActionData[]
}

export interface FlowStepData {
  message: string
  options: FlowOptionData[]
}

export interface FlowWithSteps {
  id: string
  userId: string
  name: string
  isActive: boolean
  createdAt: Date
  Steps: Array<{
    id: string
    message: string
    Options: Array<{
      id: string
      label: string
      trigger: string
      Actions: Array<{
        id: string
        type: FlowActionType
        payload: Record<string, unknown>
        order: number
      }>
    }>
  }>
}

export interface FlowSession {
  id: string
  flowId: string
  stepId: string
  userId: string
  phone: string
  status: FlowSessionStatus
  createdAt: Date
  expiresAt: Date
}

export interface FlowRepository {
  create(data: {
    userId: string
    name: string
    step: FlowStepData
  }): Promise<FlowWithSteps>

  findById(id: string): Promise<FlowWithSteps | null>
  findByUserId(userId: string): Promise<FlowWithSteps[]>

  update(data: {
    id: string
    name: string
    isActive: boolean
    step: FlowStepData
  }): Promise<FlowWithSteps>

  delete(id: string): Promise<void>

  createSession(data: {
    flowId: string
    stepId: string
    userId: string
    phone: string
    expiresAt: Date
  }): Promise<FlowSession>

  findActiveSession(userId: string, phone: string): Promise<FlowSession | null>

  completeSession(id: string): Promise<void>

  expireOldSessions(): Promise<void>
}
