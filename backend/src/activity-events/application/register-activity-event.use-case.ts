import { ActivityEventCattleNotFoundError, InvalidActivityEventInputError } from './activity-event.errors';
import type {
  ActivityAlertEvaluator,
  ActivityEventRepository,
  CattleLookup,
  RegisterActivityEventCommand,
  RegisterActivityEventResultDto
} from './activity-event.types';
import {
  assertEventType,
  assertSourceType,
  createActivityEvent,
  toRegisterActivityEventResponse
} from '../domain/activity-event';

export class RegisterActivityEventUseCase {
  private readonly events: ActivityEventRepository;
  private readonly cattle: CattleLookup;
  private readonly alertEvaluator?: ActivityAlertEvaluator;
  private readonly generateId: () => string;
  private readonly now: () => string;

  constructor(
    events: ActivityEventRepository,
    cattle: CattleLookup,
    generateId: () => string = generateUuid,
    now: () => string = () => new Date().toISOString(),
    alertEvaluator?: ActivityAlertEvaluator
  ) {
    this.events = events;
    this.cattle = cattle;
    this.alertEvaluator = alertEvaluator;
    this.generateId = generateId;
    this.now = now;
  }

  async execute(command: RegisterActivityEventCommand): Promise<RegisterActivityEventResultDto> {
    try {
      const existing = await this.events.findByEventId(command.eventId);
      if (existing) {
        return toRegisterActivityEventResponse(existing, await this.alertEvaluator?.evaluate(existing));
      }

      assertEventType(command.eventType);
      assertSourceType(command.source);

      if (!(await this.cattle.exists(command.cattleId))) {
        throw new ActivityEventCattleNotFoundError();
      }

      const event = createActivityEvent({
        id: this.generateId(),
        eventId: command.eventId,
        deviceId: command.deviceId,
        cattleId: command.cattleId,
        eventType: command.eventType,
        inactiveMinutes: command.inactiveMinutes,
        confidence: command.confidence,
        capturedAt: command.capturedAt,
        source: command.source,
        createdAt: this.now()
      });

      const saved = await this.events.save(event);
      return toRegisterActivityEventResponse(saved, await this.alertEvaluator?.evaluate(saved));
    } catch (error) {
      if (error instanceof ActivityEventCattleNotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new InvalidActivityEventInputError(error.message);
      }

      throw error;
    }
  }
}

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (token) => {
    const random = Math.floor(Math.random() * 16);
    const value = token === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
