import { env } from '@/config/validatedEnv'
import { Plan, PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'
const prisma = new PrismaClient()

async function seed() {
  const optionals = [
    'Ar condicionado central',
    'Aquecedor solar',
    'Piscina',
    'Piscina infantil',
    'Piscina olímpica',
    'Piscina com borda infinita',
    'Churrasqueira',
    'Garagem coberta',
    'Portão automático',
    'Sistema de segurança',
    'Câmeras de monitoramento',
    'Cerca elétrica',
    'Sistema de alarme',
    'Painéis solares',
    'Isolamento acústico',
    'Isolamento térmico',
    'Jardim',
    'Varanda gourmet',
    'Banheira de hidromassagem',
    'Piscina de hidromassagem',
    'Closet',
    'Quarto de hóspedes',
    'Escritório',
    'Área de serviço',
    'Depósito privativo',
    'Salão de festas',
    'Espaço fitness',
    'Playground',
    'Quadra poliesportiva',
    'Portaria 24h',
    'Elevador',
    'Elevador privativo',
    'Elevador social',
    'Elevador de serviço',
    'Lareira',
    'Terraço',
    'Forro de gesso',
    'Iluminação em LED',
    'Piso de madeira',
    'Piso porcelanato',
    'Móveis planejados',
    'Cozinha americana',
    'Despensa',
    'Lavabo',
    'Sacada',
    'Aquecimento a gás',
    'Iluminação natural',
    'Janela antirruído',
    'Infraestrutura para ar condicionado',
    'Tomadas USB',
    'Garagem para bicicletas',
    'Espaço pet',
    'Horta privativa',
    'Lavanderia',
    'Mini mercado no condomínio',
  ];


  const passwordHash = await bcrypt.hash(env.PASSWORD_ADMIN, 6)

  const users = [
    {
      email: 'andreferreiradaweb@gmail.com',
      Role: Role.ADMINISTRADOR,
      passwordHash,
      isActive: true,
      Plan: Plan.PADRAO,
    },
  ]

  for (const user of users) {
    await prisma.user.create({
      data: user,
    })
  }

  for (const opcional of optionals) {
    await prisma.houseOptional.create({
      data: {
        name: opcional,
      },
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
