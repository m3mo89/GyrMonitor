export class InvalidObservationInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidObservationInputError';
  }
}

export class AlertNotFoundError extends Error {
  constructor(alertId: string) {
    super(`Alert not found: ${alertId}`);
    this.name = 'AlertNotFoundError';
  }
}
