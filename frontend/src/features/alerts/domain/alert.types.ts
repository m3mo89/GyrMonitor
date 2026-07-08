import type { PaginationMetadata } from '../../cattle/domain';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH';
export type AlertStatus = 'PENDING' | 'IN_PROGRESS' | 'ATTENDED';

export type AlertListItem = {
  id: string;
  cattleId: string;
  tagNumber?: string;
  severity: AlertSeverity;
  riskScore: number;
  status: AlertStatus;
  reason: string;
  createdAt: string;
};

export type AlertDetail = AlertListItem & {
  eventId: string | null;
  attendedAt: string | null;
};

export type AlertListResult = {
  data: AlertListItem[];
  pagination: PaginationMetadata;
};

export type UpdateAlertStatusResult = {
  id: string;
  status: AlertStatus;
  attendedAt: string | null;
};

export type AlertObservation = {
  id: string;
  observationId?: string;
  alertId: string;
  userId: string;
  comment: string;
  createdAt: string;
  clientId?: string | null;
};
