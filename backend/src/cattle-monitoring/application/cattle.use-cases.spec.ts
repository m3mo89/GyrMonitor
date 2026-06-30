import { describe, expect, it, vi } from 'vitest';

import type { ActivityEventRepository } from '../../activity-events/application/activity-event.types';
import { EventTypes, SourceTypes, type ActivityEvent } from '../../activity-events/domain/activity-event';
import { CattleSex, CattleStatus, type Cattle } from '../domain/cattle';
import { CattleNotFoundError, InvalidCattleIdError } from './cattle.errors';
import type { CattleRepository } from './cattle.types';
import { GetCattleDetailUseCase } from './get-cattle-detail.use-case';
import { GetCattleHistoryUseCase } from './get-cattle-history.use-case';
import { ListCattleUseCase } from './list-cattle.use-case';

const cattleId = '11111111-1111-4111-8111-111111111111';
const missingId = '22222222-2222-4222-8222-222222222222';

const cattle: Cattle = {
  id: cattleId,
  tagNumber: 'GYR-001',
  breed: 'Gyr',
  sex: CattleSex.FEMALE,
  status: CattleStatus.ACTIVE,
  createdAt: '2026-06-30T00:00:00.000Z',
  lastRiskScore: 0.25
};

const event: ActivityEvent = {
  id: '33333333-3333-4333-8333-333333333333',
  eventId: '44444444-4444-4444-8444-444444444444',
  deviceId: 'device-1',
  cattleId,
  eventType: EventTypes.ACTIVITY,
  confidence: 0.95,
  capturedAt: '2026-06-30T01:00:00.000Z',
  source: SourceTypes.DESKTOP_SIMULATOR,
  createdAt: '2026-06-30T01:00:01.000Z'
};

function cattleRepository(): CattleRepository {
  return {
    list: vi.fn(async (request) => ({ data: [cattle], pagination: { ...request, total: 1 } })),
    findById: vi.fn(async (id) => (id === cattleId ? cattle : null)),
    exists: vi.fn(async (id) => id === cattleId)
  };
}

function eventRepository(): ActivityEventRepository {
  return {
    save: vi.fn(),
    findByEventId: vi.fn(),
    list: vi.fn(async (query) => ({ data: [event], pagination: { page: query.page, pageSize: query.pageSize, total: 1 } }))
  };
}

describe('cattle use cases', () => {
  it('lists cattle with normalized pagination defaults and limits', async () => {
    const repository = cattleRepository();
    const useCase = new ListCattleUseCase(repository);

    await expect(useCase.execute({ page: 0, pageSize: 500 })).resolves.toMatchObject({
      data: [{ id: cattleId, tagNumber: 'GYR-001' }],
      pagination: { page: 1, pageSize: 100, total: 1 }
    });
    expect(repository.list).toHaveBeenCalledWith({ page: 1, pageSize: 100 });
  });

  it('returns cattle detail for an existing valid id', async () => {
    await expect(new GetCattleDetailUseCase(cattleRepository()).execute(cattleId)).resolves.toEqual(cattle);
  });

  it('rejects invalid or missing cattle detail ids', async () => {
    const useCase = new GetCattleDetailUseCase(cattleRepository());

    await expect(useCase.execute('bad-id')).rejects.toBeInstanceOf(InvalidCattleIdError);
    await expect(useCase.execute(missingId)).rejects.toBeInstanceOf(CattleNotFoundError);
  });

  it('returns cattle history with normalized pagination', async () => {
    const events = eventRepository();

    await expect(new GetCattleHistoryUseCase(cattleRepository(), events).execute(cattleId, { page: 2, pageSize: 500 })).resolves.toMatchObject({
      cattleId,
      events: [{ eventId: event.eventId }],
      pagination: { page: 2, pageSize: 100, total: 1 }
    });
    expect(events.list).toHaveBeenCalledWith({ cattleId, page: 2, pageSize: 100 });
  });

  it('rejects invalid or missing cattle history ids', async () => {
    const useCase = new GetCattleHistoryUseCase(cattleRepository(), eventRepository());

    await expect(useCase.execute('bad-id')).rejects.toBeInstanceOf(InvalidCattleIdError);
    await expect(useCase.execute(missingId)).rejects.toBeInstanceOf(CattleNotFoundError);
  });
});
