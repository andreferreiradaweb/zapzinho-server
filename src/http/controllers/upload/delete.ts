import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { deleteFromCloudinary } from '@/services/cloudinary'

const bodySchema = z.object({
  url: z.string().url(),
})

export async function DeleteUploadController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { url } = bodySchema.parse(request.body)
  await deleteFromCloudinary(url)
  return reply.status(200).send({ ok: true })
}
