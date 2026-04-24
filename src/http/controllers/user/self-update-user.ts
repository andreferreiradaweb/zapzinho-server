import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { MakeSelfUpdateUseCase } from '@/factory/user/make-self-update-user'
import { Role } from '@/lib/prisma'
import { prisma } from '@/lib/prisma'

export async function SelfUpdateUserController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateBodySchema = z.object({
    password: z.string().min(6).optional(),
    phoneNumber: z.string().nullish(),
    newPassword: z
      .string()
      .min(6)
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,}$/)
      .optional(),
    prospectingInstanceId: z.string().nullish(),
    prospectingToken: z.string().nullish(),
    name: z.string().nullish(),
    lpPhoneParam: z.string().nullish(),
    lpNameParam: z.string().nullish(),
  })
  const { sub } = request.user

  try {
    const { password, phoneNumber, newPassword, prospectingInstanceId, prospectingToken, name, lpPhoneParam, lpNameParam } =
      updateBodySchema.parse(request.body)
    const requestingUser = await prisma.user.findUnique({ where: { id: sub } })
    const isAdmin = requestingUser?.Role === Role.ADMIN

    const selfUpdateUseCase = MakeSelfUpdateUseCase()
    const user = await selfUpdateUseCase.execute({
      id: sub,
      password,
      phoneNumber,
      newPassword,
      name: name ?? undefined,
      prospectingInstanceId: isAdmin ? prospectingInstanceId : undefined,
      prospectingToken: isAdmin ? prospectingToken : undefined,
      lpPhoneParam: lpPhoneParam ?? undefined,
      lpNameParam: lpNameParam ?? undefined,
    })
    return reply.status(201).send(user)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
