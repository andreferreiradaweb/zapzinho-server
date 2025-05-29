export class MaxRegistrationLimitReached extends Error {
  constructor() {
    super('Maximum registration limit reached')
  }
}
