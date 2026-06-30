import { describe, expect, it, vi } from 'vitest';

import { createObservation, type Observation } from '../domain/observation';
import { AddAlertObservationUseCase } from './add-alert-observation.use-case';
import { AlertNotFoundError, InvalidObservationInputError } from './observation.errors';
import type { AlertLookup, ObservationRepository } from './observation.types';
import { ListAlertObservationsUseCase } from './list-alert-observations.use-case';

const observationId = '11111111-1111-4111-8111-111111111111';
const alertId = '22222222-2222-4222-8222-222222222222';
const userId = '33333333-3333-4333-8333-333333333333';
const generatedId = '44444444-4444-4444-8444-444444444444';

const observation: Observation = createObservation({
  id: generatedId,
  observationId,
  alertId,
  userId,
  comment: 'Stable after field inspection',
  createdAt: '2026-06-30T02:00:00.000Z',
  clientId: 'mobile-1'
});

function repository(existing: Observation | null = null): ObservationRepository {
  return {
    save: vi.fn(async (record) => record),
    findByObservationId: vi.fn(async () => existing),
    listByAlertId: vi.fn(async () => [observation])
  };
}

function alerts(exists = true): AlertLookup {
  return {
    exists: vi.fn(async () => exists)
  };
}

const command = {
  observationId,
  alertId,
  userId,
  comment: ' Stable after field inspection ',
  createdAt: '2026-06-30T02:00:00.000Z',
  clientId: 'mobile-1'
};

describe('AddAlertObservationUseCase', () => {
  it('adds an observation with deterministic id and trimmed comment', async () => {
    const observations = repository();
    const useCase = new AddAlertObservationUseCase(observations, alerts(), () => generatedId);

    await expect(useCase.execute(command)).resolves.toEqual({
      id: generatedId,
      alertId,
      userId,
      comment: 'Stable after field inspection',
      createdAt: command.createdAt
    });
    expect(observations.save).toHaveBeenCalledWith(expect.objectContaining({ id: generatedId, comment: 'Stable after field inspection' }));
  });

  it('returns existing observations idempotently', async () => {
    const observations = repository(observation);
    const useCase = new AddAlertObservationUseCase(observations, alerts(), () => generatedId);

    await expect(useCase.execute(command)).resolves.toMatchObject({ id: generatedId, alertId });
    expect(observations.save).not.toHaveBeenCalled();
  });

  it('rejects invalid input and missing alerts', async () => {
    await expect(new AddAlertObservationUseCase(repository(), alerts(), () => generatedId).execute({ ...command, comment: '' })).rejects.toBeInstanceOf(
      InvalidObservationInputError
    );
    await expect(new AddAlertObservationUseCase(repository(), alerts(false), () => generatedId).execute(command)).rejects.toBeInstanceOf(AlertNotFoundError);
  });
});

describe('ListAlertObservationsUseCase', () => {
  it('lists observations for an existing alert', async () => {
    await expect(new ListAlertObservationsUseCase(repository(), alerts()).execute(alertId)).resolves.toEqual([
      {
        id: generatedId,
        alertId,
        userId,
        comment: 'Stable after field inspection',
        createdAt: command.createdAt
      }
    ]);
  });

  it('rejects invalid alert ids and missing alerts', async () => {
    await expect(new ListAlertObservationsUseCase(repository(), alerts()).execute('bad-id')).rejects.toBeInstanceOf(InvalidObservationInputError);
    await expect(new ListAlertObservationsUseCase(repository(), alerts(false)).execute(alertId)).rejects.toBeInstanceOf(AlertNotFoundError);
  });
});
