import type { ActivityEvent } from '../../activity-events/domain/activity-event';
import type { Alert, AlertDetailDto, AlertListItemDto, AlertStatus } from '../domain/alert';
import type { AlertSeverity } from '../../inactivity-analysis/domain/severity';

export type PaginationRequest = {
  page?: number;
  pageSize?: number;
};

export type PaginationMetadata = {
  page: number;
  pageSize: number;
  total: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: PaginationMetadata;
};

export type ListAlertsQuery = PaginationRequest & {
  status?: string;
  severity?: string;
  cattleId?: string;
};

export type NormalizedListAlertsQuery = Required<PaginationRequest> & {
  status?: AlertStatus;
  severity?: AlertSeverity;
  cattleId?: string;
};

export type AlertListResponseDto = PaginatedResult<AlertListItemDto>;
export type AlertDetailResponseDto = AlertDetailDto;

export type UpdateAlertStatusRequestDto = {
  status: string;
  attendedAt?: string;
};

export type UpdateAlertStatusCommand = {
  alertId: string;
  status: string;
  attendedAt?: string;
  userId?: string;
};

export type UpdateAlertStatusResponseDto = {
  id: string;
  status: AlertStatus;
  attendedAt: string | null;
};

export type AlertGenerationResult = {
  riskScore: number | null;
  severity: AlertSeverity | null;
  alertGenerated: boolean;
  alertId: string | null;
};

export type AlertRepository = {
  save(alert: Alert): Promise<Alert>;
  findById(alertId: string): Promise<Alert | null>;
  findBySourceEventId(sourceEventId: string): Promise<Alert | null>;
  list(query: NormalizedListAlertsQuery): Promise<PaginatedResult<Alert>>;
  updateStatus(alertId: string, status: AlertStatus, attendedAt?: string): Promise<Alert | null>;
};

export type AlertCattleLookup = {
  findTagNumber(cattleId: string): Promise<string | undefined>;
};

export type AlertEventLookup = {
  findEventId(sourceEventId: string): Promise<string | null>;
};

export type ActivityAlertEvaluator = {
  evaluate(event: ActivityEvent): Promise<AlertGenerationResult>;
};
