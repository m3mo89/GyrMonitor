import { mvpRiskCalculator } from '../../inactivity-analysis/infrastructure/inactivity-analysis-singletons';
import { GenerateAlertFromActivityEventUseCase } from '../application/generate-alert-from-activity-event.use-case';
import { UpdateAlertStatusUseCase } from '../application/update-alert-status.use-case';
import { MariaDbAlertRepository } from './mariadb-alert.repository';
import { MariaDbAlertEventLookup } from './alert-lookups';

export const sharedAlertRepository = new MariaDbAlertRepository();
export const sharedAlertEventLookup = new MariaDbAlertEventLookup();
export const updateAlertStatusUseCase = new UpdateAlertStatusUseCase(sharedAlertRepository);

// Kept as a directly-constructed singleton (not Nest DI) because `activity-events` consumes
// it via a raw import when registering activity events. Wiring it through Nest DI would
// require ActivityEventsModule to import AlertsModule, which — combined with
// AlertsModule -> CattleMonitoringModule and CattleMonitoringModule -> ActivityEventsModule
// (see cattle-monitoring.module.ts) — would form a genuine 3-module Nest import cycle.
// Resolving that would need `forwardRef()` or a deeper restructuring, out of scope here.
export const generateAlertFromActivityEventUseCase = new GenerateAlertFromActivityEventUseCase(
  sharedAlertRepository,
  mvpRiskCalculator
);
