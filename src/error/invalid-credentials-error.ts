export class InvalidCredentialsError extends Error {
  constructor() {
    super('Unauthorized')
  }
}
