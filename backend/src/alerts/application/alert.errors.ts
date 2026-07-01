export class InvalidAlertInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAlertInputError';
  }
}

export class AlertNotFoundError extends Error {
  constructor(alertId: string) {
    super(`Alert not found: ${alertId}`);
    this.name = 'AlertNotFoundError';
  }
}
