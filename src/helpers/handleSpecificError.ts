import { InactiveUser } from '@/error/inactive-user'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { MaxRegistrationLimitReached } from '@/error/max-registration'
import { RecordsFoundError } from '@/error/records-found-error'
import { ResourceNotFound } from '@/error/resource-not-found'
import { UserAlreadyExistsError } from '@/error/user-already-exists-error'
import { UserNotFound } from '@/error/user-not-found'
import { WaitAMoment } from '@/error/wait-a-moment'
import { FastifyReply } from 'fastify'

type CustomError =
  | ResourceNotFound
  | UserNotFound
  | InvalidCredentialsError
  | RecordsFoundError
  | UserAlreadyExistsError
  | MaxRegistrationLimitReached
  | InactiveUser
  | WaitAMoment

export const handleSpecificError = (
  error: CustomError | unknown,
  reply: FastifyReply,
) => {
  if (error instanceof ResourceNotFound) {
    return reply.status(404).send({ message: error.message })
  }
  if (error instanceof UserNotFound) {
    return reply.status(404).send({ message: error.message })
  }
  if (error instanceof InvalidCredentialsError) {
    return reply.status(401).send({ message: error.message })
  }
  if (error instanceof RecordsFoundError) {
    return reply.status(409).send({ message: error.message })
  }
  if (error instanceof UserAlreadyExistsError) {
    return reply.status(409).send({ message: error.message })
  }
  if (error instanceof MaxRegistrationLimitReached) {
    return reply.status(403).send({ message: error.message })
  }
  if (error instanceof InactiveUser) {
    return reply.status(403).send({ message: error.message })
  }
  if (error instanceof WaitAMoment) {
    return reply.status(400).send({ message: error.message })
  }
  throw error
}
