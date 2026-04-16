import { CustomerType, Role, User } from '@/lib/prisma'
import { hash } from 'bcrypt'
import { UserAlreadyExistsError } from '../../error/user-already-exists-error'
import { UserRepository } from '@/repositories/user'
import { v4 as uuid } from 'uuid'
import { sendWhatsAppMessage } from '@/services/wapi'
import { prisma } from '@/lib/prisma'

const ONBOARDING_MESSAGE =
  'Bem-vindo ao CRM! 🎉 Sua conta foi criada com sucesso. ' +
  'Acesse o painel para cadastrar seus contatos e começar a usar os disparos em massa.'

interface RegisterUserUseCaseRequest {
  email: string
  phoneNumber?: string
  password: string
  role: Role
  isActive: boolean
  customerType?: CustomerType
  name?: string
  address?: string
}

interface RegisterUserUseCaseResponse {
  user: Omit<User, 'passwordHash'>
}

export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
  ) { }

  async execute({
    email,
    phoneNumber,
    password,
    role,
    isActive,
    customerType,
    name,
    address,
  }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
    const userWithSameUsername =
      await this.userRepository.findUserByEmail(email)

    if (userWithSameUsername) {
      throw new UserAlreadyExistsError()
    }

    const hashedPassword = await hash(password, 6)
    const newUserId = uuid()
    const newDate = new Date()

    await this.userRepository.create({
      email,
      phoneNumber,
      passwordHash: hashedPassword,
      Role: role,
      isActive,
      id: newUserId,
      CustomerType: customerType ?? CustomerType.B2C,
      name,
      address,
    })

    const user: Omit<User, 'passwordHash'> = {
      email,
      phoneNumber: phoneNumber ?? null,
      Role: role,
      isActive,
      id: newUserId,
      createdAt: newDate,
      CustomerType: customerType ?? CustomerType.B2C,
      trialExpiresAt: null,
      onboardingMessageSentAt: null,
    }

    // Send onboarding WhatsApp message if the new user has a phone number
    if (phoneNumber) {
      const result = await sendWhatsAppMessage({
        phone: phoneNumber,
        message: ONBOARDING_MESSAGE,
      })

      if (result.success) {
        await prisma.user.update({
          where: { id: newUserId },
          data: { onboardingMessageSentAt: new Date() },
        })
        await prisma.messageLog.create({
          data: {
            id: uuid(),
            userId: newUserId,
            phone: phoneNumber,
            message: ONBOARDING_MESSAGE,
            type: 'ONBOARDING',
            status: 'SENT',
            sentAt: new Date(),
          },
        })
      }
    }

    return { user }
  }
}
