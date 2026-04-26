import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { CreateFlowFactory } from '@/factory/flow/create-flow'

const actionSchema = z.object({
  type: z.enum(['SEND_MESSAGE', 'UPDATE_LEAD_STATUS', 'ASSIGN_CATEGORY']),
  payload: z.record(z.unknown()),
  order: z.number().int().min(0).default(0),
})

const optionSchema = z.object({
  label: z.string().min(1),
  trigger: z.string().min(1),
  actions: z.array(actionSchema).default([]),
})

const bodySchema = z.object({
  name: z.string().min(1),
  step: z.object({
    message: z.string().min(1),
    options: z.array(optionSchema).min(1),
  }),
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
