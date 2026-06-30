export function toDatabaseDateTime(isoDateTime: string): string {
  return new Date(isoDateTime).toISOString().replace('T', ' ').replace('Z', '');
}

export function fromDatabaseDateTime(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  const normalized = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
  return new Date(normalized).toISOString();
}

export function fromDatabaseDate(value: string | Date | null): string | undefined {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}
