import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { CreateFlowFactory } from '@/factory/flow/create-flow'

const ALL_ACTION_TYPES = [
  'SEND_MESSAGE',
  'UPDATE_LEAD_STATUS',
  'ASSIGN_CATEGORY',
  'SEND_IMAGE',
  'SEND_TEMPLATE',
  'SEND_PRODUCT',
] as const

const actionSchema = z.object({
  type: z.enum(ALL_ACTION_TYPES),
  payload: z.record(z.unknown()),
  order: z.number().int().min(0).default(0),
})

type StepInput = {
  message: string
  options: Array<{
    label: string
    trigger: string
    actions: z.infer<typeof actionSchema>[]
    nextStep?: StepInput | null
  }>
}

const stepSchema: z.ZodType<StepInput> = z.lazy(() =>
  z.object({
    message: z.string().min(1),
    options: z
      .array(
        z.object({
          label: z.string().min(1),
          trigger: z.string().min(1),
          actions: z.array(actionSchema).default([]),
          nextStep: stepSchema.nullable().optional(),
        }),
      )
      .min(1),
  }),
)

const bodySchema = z.object({
  name: z.string().min(1),
  step: stepSchema,
})

export async function CreateFlowController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { sub } = req.user
    const { name, step } = bodySchema.parse(req.body)
    const useCase = CreateFlowFactory()
    const flow = await useCase.execute({ userId: sub, name, step })
    return reply.status(201).send(flow)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
