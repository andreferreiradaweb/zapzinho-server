import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { PrismaLeadSaleRepository } from '@/repositories/prisma/lead-sale'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

export async function ListLeadSalesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { sub } = request.user
    const { leadId } = z.object({ leadId: z.string().uuid() }).parse(request.params)

    const leadRepo = new PrismaLeadRepository()
    const lead = await leadRepo.findLeadById(leadId)
    if (!lead) throw new ResourceNotFound()
    if (lead.userId !== sub) throw new InvalidCredentialsError()

    const saleRepo = new PrismaLeadSaleRepository()
    const sales = await saleRepo.findByLeadId(leadId)
    return reply.status(200).send(sales)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
