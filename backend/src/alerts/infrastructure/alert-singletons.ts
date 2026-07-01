import { sharedCattleRepository } from '../../cattle-monitoring/infrastructure/cattle-repository-singleton';
import { mvpRiskCalculator } from '../../inactivity-analysis/infrastructure/inactivity-analysis-singletons';
import { GenerateAlertFromActivityEventUseCase } from '../application/generate-alert-from-activity-event.use-case';
import { GetAlertDetailUseCase } from '../application/get-alert-detail.use-case';
import { ListAlertsUseCase } from '../application/list-alerts.use-case';
import { UpdateAlertStatusUseCase } from '../application/update-alert-status.use-case';
import { MariaDbAlertRepository } from './mariadb-alert.repository';
import { MariaDbAlertEventLookup, RepositoryAlertCattleLookup } from './alert-lookups';

export const sharedAlertRepository = new MariaDbAlertRepository();
export const sharedAlertCattleLookup = new RepositoryAlertCattleLookup(sharedCattleRepository);
export const sharedAlertEventLookup = new MariaDbAlertEventLookup();

export const generateAlertFromActivityEventUseCase = new GenerateAlertFromActivityEventUseCase(
  sharedAlertRepository,
  mvpRiskCalculator
);

export const listAlertsUseCase = new ListAlertsUseCase(sharedAlertRepository, sharedAlertCattleLookup);
export const getAlertDetailUseCase = new GetAlertDetailUseCase(
  sharedAlertRepository,
  sharedAlertCattleLookup,
  sharedAlertEventLookup
);
export const updateAlertStatusUseCase = new UpdateAlertStatusUseCase(sharedAlertRepository);
