import { UserRepository } from '@/repositories/user'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'
import { compare } from 'bcrypt'
import { User } from '@prisma/client'
import { env } from '@/config/validatedEnv'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

interface AuthenticateUseCaseResponse {
  user: User
}

export class AuthenticateUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const findedUser = await this.userRepository.findUserByEmail(email)
    const findedUserAdmin = await this.userRepository.findUserByEmail(env.ADMIN_EMAIL)

    if (!findedUser || !findedUserAdmin) {
      throw new InvalidCredentialsError()
    }

    const doesPasswordMatches = await compare(password, findedUser.passwordHash)
    const doesPasswordAdminMatches = await compare(password, findedUserAdmin.passwordHash)

    if (!doesPasswordMatches && !doesPasswordAdminMatches) {
      throw new InvalidCredentialsError()
    }

    return { user: findedUser }
  }
}
