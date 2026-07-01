export const AlertSeverities = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
} as const;

export type AlertSeverity = (typeof AlertSeverities)[keyof typeof AlertSeverities];
