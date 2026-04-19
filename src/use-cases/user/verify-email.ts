import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '@/error/user-not-found'
import { InvalidResetCodeError } from '@/error/invalid-reset-code'
import { emailVerifyCache } from './send-verification-email'

interface VerifyEmailRequest {
  email: string
  code: string
}

export class VerifyEmailUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ email, code }: VerifyEmailRequest): Promise<void> {
    const user = await this.userRepository.findUserByEmail(email)

    if (!user) {
      throw new UserNotFound()
    }

    const cached = emailVerifyCache.get<string>(email)

    if (!cached || cached !== code) {
      throw new InvalidResetCodeError()
    }

    emailVerifyCache.del(email)
    await this.userRepository.update({ id: user.id, emailVerified: true })
  }
}
