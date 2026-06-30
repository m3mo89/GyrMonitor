export class CattleNotFoundError extends Error {
  constructor() {
    super('Cattle record was not found.');
    this.name = 'CattleNotFoundError';
  }
}

export class InvalidCattleIdError extends Error {
  constructor() {
    super('Cattle id must be a valid UUID.');
    this.name = 'InvalidCattleIdError';
  }
}
