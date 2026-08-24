import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeUpdateRagSettings } from '@/factory/user/make-update-rag-settings'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function updateRagSettingsController(request: FastifyRequest, reply: FastifyReply) {
  const { ragAutoReplyEnabled } = z
    .object({ ragAutoReplyEnabled: z.boolean() })
    .parse(request.body)
  const { sub: userId } = request.user
  try {
    const user = await makeUpdateRagSettings().execute({ userId, ragAutoReplyEnabled })
    return reply.status(200).send({ ragAutoReplyEnabled: user.ragAutoReplyEnabled })
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
