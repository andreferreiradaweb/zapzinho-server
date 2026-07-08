import {
  PrismaEmailListRepository,
  PrismaEmailSubscriberRepository,
} from '@/repositories/prisma/email'
import { AddEmailSubscriberUseCase } from '@/use-cases/email/add-email-subscriber'

export function makeAddEmailSubscriber() {
  return new AddEmailSubscriberUseCase(
    new PrismaEmailListRepository(),
    new PrismaEmailSubscriberRepository(),
  )
}
