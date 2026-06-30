export function parseJwtExpiresInSeconds(value: string): number {
  const match = value.match(/^(\d+)(s|m|h)?$/);

  if (!match) {
    return 3600;
  }

  const amount = Number(match[1]);
  const unit = match[2] ?? 's';

  if (unit === 'h') {
    return amount * 60 * 60;
  }

  if (unit === 'm') {
    return amount * 60;
  }

  return amount;
}
