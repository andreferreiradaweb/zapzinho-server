import { UserRepository } from '@/repositories/user'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'
import { compare } from 'bcrypt'
import { User } from '@/lib/prisma'

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

    if (!findedUser) {
      throw new InvalidCredentialsError()
    }

    const doesPasswordMatches = await compare(password, findedUser.passwordHash)

    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError()
    }

    return { user: findedUser }
  }
}
