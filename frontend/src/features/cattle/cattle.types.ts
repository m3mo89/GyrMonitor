export type CattleSex = 'MALE' | 'FEMALE';

export type CattleStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_OBSERVATION';

export type CattleSummary = {
  id: string;
  tagNumber: string;
  breed: string;
  sex: CattleSex;
  status: CattleStatus;
  lastRiskScore?: number;
};

export type CattleDetail = CattleSummary & {
  birthDate?: string;
  createdAt: string;
};

export type PaginationMetadata = {
  page: number;
  pageSize: number;
  total: number;
};

export type ActivityEventType = 'ACTIVITY' | 'INACTIVITY';

export type ActivityEventSource =
  | 'DESKTOP_SIMULATOR'
  | 'MOBILE_CAPTURE'
  | 'SIMULATOR'
  | 'MOBILE_CLIENT'
  | 'DESKTOP_CLIENT'
  | 'MANUAL_ENTRY'
  | 'CONTROLLED_TEST_DATA';

export type ActivityEvent = {
  id: string;
  eventId: string;
  deviceId: string;
  cattleId: string;
  eventType: ActivityEventType;
  inactiveMinutes?: number;
  confidence: number;
  capturedAt: string;
  source: ActivityEventSource;
  createdAt: string;
};

export type CattleHistory = {
  cattleId: string;
  events: ActivityEvent[];
  pagination: PaginationMetadata;
};
