export class InvalidResetCodeError extends Error {
  constructor() {
    super('Código inválido ou expirado.')
    this.name = 'InvalidResetCodeError'
  }
}
