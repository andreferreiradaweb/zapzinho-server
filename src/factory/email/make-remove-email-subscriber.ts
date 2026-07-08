import { PrismaEmailSubscriberRepository } from '@/repositories/prisma/email'
import { RemoveEmailSubscriberUseCase } from '@/use-cases/email/remove-email-subscriber'

export function makeRemoveEmailSubscriber() {
  return new RemoveEmailSubscriberUseCase(new PrismaEmailSubscriberRepository())
}
