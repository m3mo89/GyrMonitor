import { useTranslation } from 'react-i18next';

import { LoadingState, UiState } from '../../../shared/components/UiState';
import { useCattleList } from '../application';

type CattleListPageProps = {
  onOpenCattle(id: string): void;
};

export function CattleListPage({ onOpenCattle }: CattleListPageProps) {
  const { t } = useTranslation('cattle');
  const { data: result, isLoading, isError } = useCattleList();

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
              <th>{t('list.columnTag')}</th>
              <th>{t('list.columnBreed')}</th>
              <th>{t('list.columnSex')}</th>
              <th>{t('list.columnStatus')}</th>
              <th>{t('list.columnRisk')}</th>
              <th>{t('list.columnDetail')}</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((cattle) => (
              <tr key={cattle.id}>
                <td>
                  <strong>{cattle.tagNumber}</strong>
                </td>
                <td>{cattle.breed}</td>
                <td>{cattle.sex}</td>
                <td>
                  <span className="status-badge">{cattle.status}</span>
                </td>
                <td>{cattle.lastRiskScore ?? t('list.notAvailable')}</td>
                <td>
                  <button className="button" onClick={() => onOpenCattle(cattle.id)} type="button">
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
