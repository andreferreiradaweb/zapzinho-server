export class EmailNotVerifiedError extends Error {
  constructor() {
    super('Verifique seu e-mail antes de fazer login.')
    this.name = 'EmailNotVerifiedError'
  }
}
