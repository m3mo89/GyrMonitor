export class InvalidActivityEventInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidActivityEventInputError';
  }
}

export class ActivityEventCattleNotFoundError extends Error {
  constructor() {
    super('Cattle record was not found.');
    this.name = 'ActivityEventCattleNotFoundError';
  }
}
