import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '@/error/user-not-found'
import { InvalidResetCodeError } from '@/error/invalid-reset-code'
import { resetCodeCache } from './forgot-password'
import { hash } from 'bcrypt'

interface ResetPasswordRequest {
  email: string
  code: string
  newPassword: string
}

export class ResetPasswordUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ email, code, newPassword }: ResetPasswordRequest): Promise<void> {
    const user = await this.userRepository.findUserByEmail(email)

    if (!user) {
      throw new UserNotFound()
    }

    const cached = resetCodeCache.get<string>(email)

    if (!cached || cached !== code) {
      throw new InvalidResetCodeError()
    }

    resetCodeCache.del(email)

    const passwordHash = await hash(newPassword, 6)
    await this.userRepository.update({ id: user.id, passwordHash })
  }
}
