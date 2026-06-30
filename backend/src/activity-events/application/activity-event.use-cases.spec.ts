import { describe, expect, it, vi } from 'vitest';

import { ActivityEventCattleNotFoundError, InvalidActivityEventInputError } from './activity-event.errors';
import type { ActivityEventRepository, CattleLookup } from './activity-event.types';
import { ListActivityEventsUseCase } from './list-activity-events.use-case';
import { RegisterActivityEventUseCase } from './register-activity-event.use-case';
import { EventTypes, SourceTypes, type ActivityEvent } from '../domain/activity-event';

const eventId = '11111111-1111-4111-8111-111111111111';
const cattleId = '22222222-2222-4222-8222-222222222222';
const generatedId = '33333333-3333-4333-8333-333333333333';

const event: ActivityEvent = {
  id: generatedId,
  eventId,
  deviceId: 'device-1',
  cattleId,
  eventType: EventTypes.INACTIVITY,
  inactiveMinutes: 45,
  confidence: 0.91,
  capturedAt: '2026-06-30T01:00:00.000Z',
  source: SourceTypes.DESKTOP_SIMULATOR,
  createdAt: '2026-06-30T01:00:01.000Z'
};

function repository(existing: ActivityEvent | null = null): ActivityEventRepository {
  return {
    save: vi.fn(async (record) => record),
    findByEventId: vi.fn(async () => existing),
    list: vi.fn(async (query) => ({ data: [event], pagination: { page: query.page, pageSize: query.pageSize, total: 1 } }))
  };
}

function cattle(exists = true): CattleLookup {
  return {
    exists: vi.fn(async () => exists)
  };
}

const command = {
  eventId,
  deviceId: ' device-1 ',
  cattleId,
  eventType: EventTypes.INACTIVITY,
  inactiveMinutes: 45,
  confidence: 0.91,
  capturedAt: '2026-06-30T01:00:00.000Z',
  source: SourceTypes.DESKTOP_SIMULATOR
};

describe('RegisterActivityEventUseCase', () => {
  it('registers a valid event with deterministic id and clock', async () => {
    const events = repository();
    const useCase = new RegisterActivityEventUseCase(events, cattle(), () => generatedId, () => event.createdAt);

    await expect(useCase.execute(command)).resolves.toEqual({
      eventId,
      riskScore: null,
      severity: null,
      alertGenerated: false,
      alertId: null
    });
    expect(events.save).toHaveBeenCalledWith(expect.objectContaining({ id: generatedId, deviceId: 'device-1', cattleId }));
  });

  it('returns the existing response for duplicate event ids', async () => {
    const events = repository(event);
    const useCase = new RegisterActivityEventUseCase(events, cattle(), () => generatedId, () => event.createdAt);

    await expect(useCase.execute(command)).resolves.toMatchObject({ eventId });
    expect(events.save).not.toHaveBeenCalled();
  });

  it('rejects invalid input', async () => {
    const useCase = new RegisterActivityEventUseCase(repository(), cattle(), () => generatedId, () => event.createdAt);

    await expect(useCase.execute({ ...command, confidence: 2 })).rejects.toBeInstanceOf(InvalidActivityEventInputError);
    await expect(useCase.execute({ ...command, eventType: 'UNKNOWN' })).rejects.toBeInstanceOf(InvalidActivityEventInputError);
  });

  it('rejects events for missing cattle', async () => {
    const useCase = new RegisterActivityEventUseCase(repository(), cattle(false), () => generatedId, () => event.createdAt);

    await expect(useCase.execute(command)).rejects.toBeInstanceOf(ActivityEventCattleNotFoundError);
  });
});

describe('ListActivityEventsUseCase', () => {
  it('passes normalized filters and pagination to the repository', async () => {
    const events = repository();
    const useCase = new ListActivityEventsUseCase(events);

    await expect(
      useCase.execute({
        cattleId,
        eventType: EventTypes.INACTIVITY,
        from: '2026-06-30T00:00:00.000Z',
        to: '2026-06-30T02:00:00.000Z',
        page: 0,
        pageSize: 999
      })
    ).resolves.toMatchObject({ data: [{ eventId }], pagination: { page: 1, pageSize: 100, total: 1 } });
    expect(events.list).toHaveBeenCalledWith({
      cattleId,
      eventType: EventTypes.INACTIVITY,
      from: '2026-06-30T00:00:00.000Z',
      to: '2026-06-30T02:00:00.000Z',
      page: 1,
      pageSize: 100
    });
  });

  it('rejects invalid query filters', async () => {
    const useCase = new ListActivityEventsUseCase(repository());

    await expect(useCase.execute({ cattleId: 'bad-id' })).rejects.toBeInstanceOf(InvalidActivityEventInputError);
    await expect(useCase.execute({ eventType: 'UNKNOWN' })).rejects.toBeInstanceOf(InvalidActivityEventInputError);
    await expect(useCase.execute({ from: 'not-a-date' })).rejects.toBeInstanceOf(InvalidActivityEventInputError);
  });
});
