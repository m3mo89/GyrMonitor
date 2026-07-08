import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LoadingState, UiState } from '../../../shared/components/UiState';
import { formatDateTime } from '../../../shared/utils/format-date-time';
import { Roles, useAuth } from '../../auth';
import { useAlertDetail, useAlertObservations, useUpdateAlertStatus } from '../application';
import type { AlertStatus } from '../domain';
import { severityClass, statusClass } from './alert-badges';

type AlertDetailPageProps = {
  alertId: string;
  onBackToList(): void;
  onOpenCattle(id: string): void;
};

export function AlertDetailPage({ alertId, onBackToList, onOpenCattle }: AlertDetailPageProps) {
  const { t } = useTranslation('alerts');
  const { session } = useAuth();
  const { data: alert, isLoading: isAlertLoading, isError: isAlertError } = useAlertDetail(alertId);
  const { data: observations = [], isLoading: isObservationsLoading, isError: isObservationsError } = useAlertObservations(alertId);
  const updateAlertStatus = useUpdateAlertStatus(alertId);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const isLoading = isAlertLoading || isObservationsLoading;
  const error = isAlertError || isObservationsError ? t('detail.genericError') : null;
  const observationsError = isObservationsError && !isAlertError ? t('detail.observationsErrorMessage') : null;

  async function changeStatus(status: AlertStatus) {
    setUpdateError(null);

    try {
      await updateAlertStatus.mutateAsync(status);
    } catch {
      setUpdateError(t('detail.updateError'));
    }
  }

  if (isLoading) {
    return (
      <div className="page-stack">
        <button className="button" onClick={onBackToList} type="button">
          {t('detail.back')}
        </button>
        <LoadingState title={t('detail.loading')} />
      </div>
    );
  }

  if (error && !alert) {
    return (
      <div className="page-stack">
        <button className="button" onClick={onBackToList} type="button">
          {t('detail.back')}
        </button>
        <UiState title={t('detail.errorTitle')} description={error} tone="danger" />
      </div>
    );
  }

  if (!alert) {
    return <UiState title={t('detail.notFoundTitle')} description={t('detail.notFoundDescription')} tone="danger" />;
  }

  const canUpdate = session?.user.role === Roles.ADMIN || session?.user.role === Roles.FIELD_OPERATOR;

  return (
    <div className="page-stack">
      <div className="button-row">
        <button className="button" onClick={onBackToList} type="button">
          {t('detail.back')}
        </button>
        <button className="button" onClick={() => onOpenCattle(alert.cattleId)} type="button">
          {t('detail.viewCattle')}
        </button>
      </div>
      <header className="page-header">
        <div>
          <p className="eyebrow">{t('detail.eyebrow')}</p>
          <h1>{alert.tagNumber ?? alert.cattleId}</h1>
          <p>{alert.reason}</p>
        </div>
        <span className={statusClass(alert.status)}>{alert.status}</span>
      </header>
      {updateError ? <UiState title={t('detail.updateNotAppliedTitle')} description={updateError} tone="danger" /> : null}
      <dl className="detail-grid">
        <div className="detail-item">
          <dt>{t('detail.fieldSeverity')}</dt>
          <dd>
            <span className={severityClass(alert.severity)}>{alert.severity}</span>
          </dd>
        </div>
        <div className="detail-item">
          <dt>{t('detail.fieldRiskScore')}</dt>
          <dd>{alert.riskScore}</dd>
        </div>
        <div className="detail-item">
          <dt>{t('detail.fieldCreatedAt')}</dt>
          <dd>{formatDateTime(alert.createdAt)}</dd>
        </div>
        <div className="detail-item">
          <dt>{t('detail.fieldAttendedAt')}</dt>
          <dd>{alert.attendedAt ? formatDateTime(alert.attendedAt) : t('detail.notAvailable')}</dd>
        </div>
        <div className="detail-item">
          <dt>{t('detail.fieldEventId')}</dt>
          <dd>{alert.eventId ?? t('detail.notAvailable')}</dd>
        </div>
        <div className="detail-item">
          <dt>{t('detail.fieldCattleId')}</dt>
          <dd>{alert.cattleId}</dd>
        </div>
      </dl>
      <section className="panel">
        <div className="panel__header">
          <div>
            <h2>{t('detail.observationsTitle')}</h2>
            <p>{t('detail.observationsSubtitle')}</p>
          </div>
        </div>
        {observationsError ? <UiState title={t('detail.observationsErrorTitle')} description={observationsError} tone="danger" /> : null}
        {observations.length === 0 ? (
          <UiState title={t('detail.observationsEmptyTitle')} description={t('detail.observationsEmptyDescription')} />
        ) : (
          <div className="observation-list">
            {observations.map((observation) => (
              <article className="observation-item" key={observation.id}>
                <p>{observation.comment}</p>
                <small>
                  {formatDateTime(observation.createdAt)}
                  {observation.clientId ? ` · ${observation.clientId}` : ''}
                </small>
              </article>
            ))}
          </div>
        )}
      </section>
      {canUpdate ? (
        <section className="panel">
          <div className="panel__header">
            <div>
              <h2>{t('detail.updateStatusTitle')}</h2>
              <p>{t('detail.updateStatusSubtitle')}</p>
            </div>
          </div>
          <div className="button-row">
            <button className="button" disabled={updateAlertStatus.isPending || alert.status !== 'PENDING'} onClick={() => void changeStatus('IN_PROGRESS')} type="button">
              {t('detail.markInProgress')}
            </button>
            <button
              className="button button--primary"
              disabled={updateAlertStatus.isPending || alert.status === 'ATTENDED'}
              onClick={() => void changeStatus('ATTENDED')}
              type="button"
            >
              {t('detail.markAttended')}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
