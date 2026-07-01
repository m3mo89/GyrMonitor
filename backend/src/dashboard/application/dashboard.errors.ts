export class InvalidDashboardQueryError extends Error {
  constructor(message = 'Invalid dashboard query.') {
    super(message);
    this.name = 'InvalidDashboardQueryError';
  }
}
