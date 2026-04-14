import { env } from '@/config/validatedEnv'
import { prisma, Role, User, CustomerType } from '@/lib/prisma'
import bcrypt from 'bcrypt'

async function seed() {

  const adminHash = await bcrypt.hash(env.PASSWORD_ADMIN, 6)
  const clientHash = await bcrypt.hash('Teste123', 6)

  const users = [
    {
      email: 'andreferreiradaweb@gmail.com',
      Role: Role.ADMIN,
      CustomerType: CustomerType.B2C,
      passwordHash: adminHash,
      isActive: true,
    },
    {
      email: 'cliente@teste.com',
      Role: Role.CLIENT,
      CustomerType: CustomerType.B2C,
      passwordHash: clientHash,
      isActive: true,
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
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
