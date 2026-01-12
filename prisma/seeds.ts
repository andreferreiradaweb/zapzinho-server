import { env } from '@/config/validatedEnv'
import { prisma, Role, User, CustomerType } from '@/lib/prisma'
import bcrypt from 'bcrypt'

async function seed() {

  const passwordHash = await bcrypt.hash(env.PASSWORD_ADMIN, 6)

  const users = [
    {
      email: 'andreferreiradaweb@gmail.com',
      Role: Role.ADMIN,
      CustomerType: CustomerType.B2C,
      passwordHash,
      isActive: true,
    },
  ]

  for (const user of users) {
    await prisma.user.create({
      data: user,
    })
  }

  console.log('Seeds criadas com sucesso!')
}

seed()
  .catch((error) => {
    console.error(error)
  })
  .finally(() => {
    prisma.$disconnect()
  })
