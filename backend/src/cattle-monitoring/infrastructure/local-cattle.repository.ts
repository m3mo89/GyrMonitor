import type { Cattle } from '../domain/cattle';
import { CattleSex, CattleStatus, createCattle } from '../domain/cattle';
import type { CattleRepository, PaginatedResult, PaginationRequest } from '../application/cattle.types';

export const localCattleSeed: Cattle[] = [
  createCattle({
    id: '10000000-0000-4000-8000-000000000001',
    tagNumber: 'GYR-001',
    sex: CattleSex.FEMALE,
    birthDate: '2021-03-14',
    status: CattleStatus.ACTIVE,
    createdAt: '2026-06-26T00:00:00.000Z',
    lastRiskScore: 18.5
  }),
  createCattle({
    id: '10000000-0000-4000-8000-000000000002',
    tagNumber: 'GYR-014',
    sex: CattleSex.FEMALE,
    birthDate: '2020-09-02',
    status: CattleStatus.UNDER_OBSERVATION,
    createdAt: '2026-06-26T00:00:00.000Z',
    lastRiskScore: 72
  }),
  createCattle({
    id: '10000000-0000-4000-8000-000000000003',
    tagNumber: 'GYR-023',
    sex: CattleSex.FEMALE,
    status: CattleStatus.ACTIVE,
    createdAt: '2026-06-26T00:00:00.000Z',
    lastRiskScore: 87.5
  }),
  createCattle({
    id: '10000000-0000-4000-8000-000000000004',
    tagNumber: 'GYR-031',
    sex: CattleSex.MALE,
    birthDate: '2019-11-21',
    status: CattleStatus.INACTIVE,
    createdAt: '2026-06-26T00:00:00.000Z'
  })
];

export class LocalCattleRepository implements CattleRepository {
  private readonly records: Cattle[];

  constructor(records: Cattle[] = localCattleSeed) {
    assertUniqueTagNumbers(records);
    this.records = [...records].sort((left, right) => left.tagNumber.localeCompare(right.tagNumber));
  }

  async list(request: Required<PaginationRequest>): Promise<PaginatedResult<Cattle>> {
    const start = (request.page - 1) * request.pageSize;
    const end = start + request.pageSize;

    return {
      data: this.records.slice(start, end),
      pagination: {
        page: request.page,
        pageSize: request.pageSize,
        total: this.records.length
      }
    };
  }

  async findById(id: string): Promise<Cattle | null> {
    return this.records.find((record) => record.id === id) ?? null;
  }

  async exists(id: string): Promise<boolean> {
    return this.records.some((record) => record.id === id);
  }
}

function assertUniqueTagNumbers(records: Cattle[]): void {
  const tagNumbers = new Set<string>();

  for (const record of records) {
    if (tagNumbers.has(record.tagNumber)) {
      throw new Error(`Duplicate cattle tag number: ${record.tagNumber}`);
    }

    tagNumbers.add(record.tagNumber);
  }
}
