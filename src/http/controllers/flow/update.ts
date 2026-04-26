import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { UpdateFlowFactory } from '@/factory/flow/update-flow'

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

const paramsSchema = z.object({ id: z.string().uuid() })

const bodySchema = z.object({
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  step: stepSchema,
})

export async function UpdateFlowController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { sub } = req.user
    const { id } = paramsSchema.parse(req.params)
    const { name, isActive, step } = bodySchema.parse(req.body)
    const useCase = UpdateFlowFactory()
    const flow = await useCase.execute({ id, userId: sub, name, isActive, step })
    return reply.status(200).send(flow)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
