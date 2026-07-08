import { useTranslation } from 'react-i18next';

import { LoadingState, UiState } from '../../../shared/components/UiState';
import { formatDateTime } from '../../../shared/utils/format-date-time';
import { useAlertsList } from '../application';
import { severityClass, statusClass } from './alert-badges';

type AlertsListPageProps = {
  onOpenAlert(id: string): void;
};

export function AlertsListPage({ onOpenAlert }: AlertsListPageProps) {
  const { t } = useTranslation('alerts');
  const { data: result, isLoading, isError } = useAlertsList();

  if (isLoading) {
    return <LoadingState title={t('list.loading')} />;
  }

  if (isError) {
    return <UiState title={t('list.errorTitle')} description={t('list.errorDescription')} tone="danger" />;
  }

  if (!result || result.data.length === 0) {
    return <UiState title={t('list.emptyTitle')} description={t('list.emptyDescription')} />;
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">{t('list.eyebrow')}</p>
          <h1>{t('list.title')}</h1>
          <p>{t('list.subtitle', { count: result.pagination.total })}</p>
        </div>
      </header>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('list.columnCattle')}</th>
              <th>{t('list.columnSeverity')}</th>
              <th>{t('list.columnStatus')}</th>
              <th>{t('list.columnRisk')}</th>
              <th>{t('list.columnReason')}</th>
              <th>{t('list.columnCreated')}</th>
              <th>{t('list.columnDetail')}</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((alert) => (
              <tr key={alert.id}>
                <td>
                  <strong>{alert.tagNumber ?? alert.cattleId}</strong>
                </td>
                <td>
                  <span className={severityClass(alert.severity)}>{alert.severity}</span>
                </td>
                <td>
                  <span className={statusClass(alert.status)}>{alert.status}</span>
                </td>
                <td>{alert.riskScore}</td>
                <td>{alert.reason}</td>
                <td>{formatDateTime(alert.createdAt)}</td>
                <td>
                  <button className="button" onClick={() => onOpenAlert(alert.id)} type="button">
                    {t('list.viewAction')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
