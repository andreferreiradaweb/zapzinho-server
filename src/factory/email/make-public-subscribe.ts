import {
  PrismaEmailListRepository,
  PrismaEmailSubscriberRepository,
} from '@/repositories/prisma/email'
import { PublicSubscribeUseCase } from '@/use-cases/email/public-subscribe'

export function makePublicSubscribe() {
  return new PublicSubscribeUseCase(
    new PrismaEmailListRepository(),
    new PrismaEmailSubscriberRepository(),
  )
}
