export const CattleSex = {
  MALE: 'MALE',
  FEMALE: 'FEMALE'
} as const;

export type CattleSex = (typeof CattleSex)[keyof typeof CattleSex];

export const CattleStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  UNDER_OBSERVATION: 'UNDER_OBSERVATION'
} as const;

export type CattleStatus = (typeof CattleStatus)[keyof typeof CattleStatus];

export type Cattle = {
  id: string;
  tagNumber: string;
  breed: string;
  sex: CattleSex;
  birthDate?: string;
  status: CattleStatus;
  createdAt: string;
  lastRiskScore?: number;
};

export type CattleSummaryDto = {
  id: string;
  tagNumber: string;
  breed: string;
  sex: CattleSex;
  status: CattleStatus;
  lastRiskScore?: number;
};

export type CattleDetailDto = Cattle;

export function createCattle(record: Omit<Cattle, 'breed'> & { breed?: string }): Cattle {
  return {
    ...record,
    breed: record.breed ?? 'Gyr'
  };
}

export function toCattleSummaryDto(cattle: Cattle): CattleSummaryDto {
  return {
    id: cattle.id,
    tagNumber: cattle.tagNumber,
    breed: cattle.breed,
    sex: cattle.sex,
    status: cattle.status,
    lastRiskScore: cattle.lastRiskScore
  };
}

export function toCattleDetailDto(cattle: Cattle): CattleDetailDto {
  return { ...cattle };
}
