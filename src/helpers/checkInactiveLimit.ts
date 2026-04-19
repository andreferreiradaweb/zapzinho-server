import { prisma } from '@/lib/prisma'
import { MaxRegistrationLimitReached } from '@/error/max-registration'

const INACTIVE_LIMIT = 5

export async function checkInactiveLimit(
  userId: string,
  countFn: () => Promise<number>,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user && !user.isActive) {
    const count = await countFn()
    if (count >= INACTIVE_LIMIT) {
      throw new MaxRegistrationLimitReached()
    }
  }
}
