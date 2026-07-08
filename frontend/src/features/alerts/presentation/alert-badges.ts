export function statusClass(status: string): string {
  if (status === 'ATTENDED') {
    return 'status-badge';
  }

  if (status === 'IN_PROGRESS') {
    return 'status-badge status-badge--warning';
  }

  return 'status-badge status-badge--danger';
}

export function severityClass(severity: string): string {
  if (severity === 'HIGH') {
    return 'status-badge status-badge--danger';
  }

  if (severity === 'MEDIUM') {
    return 'status-badge status-badge--warning';
  }

  return 'status-badge';
}
