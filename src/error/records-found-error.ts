export class RecordsFoundError extends Error {
  constructor() {
    super('Service not allowed, records found')
  }
}
