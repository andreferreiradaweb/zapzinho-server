import {
  PrismaEmailListRepository,
  PrismaEmailSubscriberRepository,
} from '@/repositories/prisma/email'
import { ListEmailSubscribersUseCase } from '@/use-cases/email/list-email-subscribers'

export function makeListEmailSubscribers() {
  return new ListEmailSubscribersUseCase(
    new PrismaEmailListRepository(),
    new PrismaEmailSubscriberRepository(),
  )
}
