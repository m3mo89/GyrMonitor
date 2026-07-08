import { useTranslation } from 'react-i18next';

import { LoadingState, UiState } from '../../../shared/components/UiState';
import { formatDateTime } from '../../../shared/utils/format-date-time';
import { useCattleDetail, useCattleHistory } from '../application';

type CattleDetailPageProps = {
  cattleId: string;
  onBackToList(): void;
};

export function CattleDetailPage({ cattleId, onBackToList }: CattleDetailPageProps) {
  const { t } = useTranslation('cattle');
  const { data: cattle, isLoading: isCattleLoading, isError: isCattleError, error: cattleError } = useCattleDetail(cattleId);
  const { data: history, isLoading: isHistoryLoading, isError: isHistoryError } = useCattleHistory(cattleId);

  const isLoading = isCattleLoading || isHistoryLoading;
  const error = isCattleError || isHistoryError ? (isNotFound(cattleError) ? t('detail.notFound') : t('detail.genericError')) : null;

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

  if (error || !cattle) {
    return (
      <div className="page-stack">
        <button className="button" onClick={onBackToList} type="button">
          {t('detail.back')}
        </button>
        <UiState title={t('detail.errorTitle')} description={error ?? t('detail.notFound')} tone="danger" />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="button-row">
        <button className="button" onClick={onBackToList} type="button">
          {t('detail.back')}
        </button>
      </div>
      <header className="page-header">
        <div>
          <p className="eyebrow">{t('detail.eyebrow')}</p>
          <h1>{cattle.tagNumber}</h1>
          <p>{t('detail.subtitle')}</p>
        </div>
        <span className="status-badge">{cattle.status}</span>
      </header>
      <dl className="detail-grid">
        <div className="detail-item">
          <dt>{t('detail.fieldBreed')}</dt>
          <dd>{cattle.breed}</dd>
        </div>
        <div className="detail-item">
          <dt>{t('detail.fieldSex')}</dt>
          <dd>{cattle.sex}</dd>
        </div>
        <div className="detail-item">
          <dt>{t('detail.fieldBirthDate')}</dt>
          <dd>{cattle.birthDate ?? t('detail.notAvailable')}</dd>
        </div>
        <div className="detail-item">
          <dt>{t('detail.fieldRisk')}</dt>
          <dd>{cattle.lastRiskScore ?? t('detail.notAvailable')}</dd>
        </div>
      </dl>
      <section className="panel" aria-label={t('detail.historyAriaLabel')}>
        <div className="panel__header">
          <div>
            <h2>{t('detail.historyTitle')}</h2>
            <p>{t('detail.historySubtitle')}</p>
          </div>
          <span className="status-badge">{t('detail.historyCount', { count: history?.pagination.total ?? 0 })}</span>
        </div>
        {!history || history.events.length === 0 ? (
          <UiState title={t('detail.historyEmptyTitle')} description={t('detail.historyEmptyDescription')} />
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('detail.columnType')}</th>
                  <th>{t('detail.columnCapturedAt')}</th>
                  <th>{t('detail.columnInactive')}</th>
                  <th>{t('detail.columnConfidence')}</th>
                  <th>{t('detail.columnSource')}</th>
                </tr>
              </thead>
              <tbody>
                {history.events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <span className={event.eventType === 'INACTIVITY' ? 'status-badge status-badge--warning' : 'status-badge'}>{event.eventType}</span>
                    </td>
                    <td>{formatDateTime(event.capturedAt)}</td>
                    <td>{event.inactiveMinutes ?? t('detail.notAvailable')}</td>
                    <td>{Math.round(event.confidence * 100)}%</td>
                    <td>{event.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function isNotFound(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as { error?: { code?: string }; statusCode?: number };
  return maybeError.error?.code === 'NOT_FOUND' || maybeError.statusCode === 404;
}
