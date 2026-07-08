import { FastifyRequest, FastifyReply } from 'fastify'
import { makeListEmailCampaigns } from '@/factory/email/make-list-email-campaigns'

export async function listEmailCampaignsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user.sub
  const result = await makeListEmailCampaigns().execute(userId)
  return reply.status(200).send(result)
}
