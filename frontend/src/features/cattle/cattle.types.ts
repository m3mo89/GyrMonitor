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

export type CattleHistoryPlaceholder = {
  cattleId: string;
  events: [];
  pagination: PaginationMetadata;
  placeholder: true;
  message: string;
};
