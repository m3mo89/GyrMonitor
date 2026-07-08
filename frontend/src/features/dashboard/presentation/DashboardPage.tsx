import { useTranslation } from 'react-i18next';

import { LoadingState, UiState } from '../../../shared/components/UiState';
import { useDashboardMetrics } from '../application';
import type { DashboardMetrics, DashboardTrendItem } from '../domain';

type MetricKey = keyof Pick<DashboardMetrics, 'totalCattle' | 'activeAlerts' | 'averageRiskScore' | 'highRiskCattle' | 'eventsToday' | 'syncPendingCount'>;

const metricConfig: Array<{
  key: MetricKey;
  tone?: 'default' | 'attention' | 'success';
}> = [
  { key: 'totalCattle', tone: 'success' },
  { key: 'activeAlerts', tone: 'attention' },
  { key: 'averageRiskScore' },
  { key: 'highRiskCattle', tone: 'attention' },
  { key: 'eventsToday' },
  { key: 'syncPendingCount' }
];

export function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const dashboard = useDashboardMetrics();
  const isShowingStaleData = dashboard.isError && Boolean(dashboard.data);

  if (dashboard.isLoading) {
    return <LoadingState title={t('loading')} />;
  }

  if (dashboard.isError && !dashboard.data) {
    return (
      <UiState
        title={t('errorTitle')}
        description={t('errorDescription')}
        tone="danger"
        action={
          <button className="button button--primary" onClick={() => void dashboard.refetch()} type="button">
            {t('retry')}
          </button>
        }
      />
    );
  }

  const data = dashboard.data;

  if (!data) {
    return <UiState title={t('noDataTitle')} description={t('noDataDescription')} />;
  }

  const isEmpty = data.totalCattle === 0 && data.activeAlerts === 0 && data.riskRanking.length === 0 && data.trend.length === 0;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">{t('eyebrow')}</p>
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </div>
        {isShowingStaleData ? <span className="status-badge status-badge--warning">{t('staleBadge')}</span> : <span className="status-badge">{t('freshBadge')}</span>}
      </header>

      {isEmpty ? <UiState title={t('emptyStateTitle')} description={t('emptyStateDescription')} /> : null}

      <section className="metric-grid" aria-label={t('metricsAriaLabel')}>
        {metricConfig.map((metric) => (
          <article className={`metric-card metric-card--${metric.tone ?? 'default'}`} key={metric.key}>
            <p>{t(`metrics.${metric.key}.label`)}</p>
            <strong>{formatNumber(data[metric.key])}</strong>
            <span>{t(`metrics.${metric.key}.hint`)}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h2>{t('riskRankingTitle')}</h2>
              <p>{t('riskRankingSubtitle')}</p>
            </div>
          </div>
          {data.riskRanking.length === 0 ? (
            <UiState title={t('riskRankingEmptyTitle')} description={t('riskRankingEmptyDescription')} />
          ) : (
            <div className="ranking-list">
              {data.riskRanking.map((item, index) => (
                <div className="ranking-row" key={item.cattleId}>
                  <span className="ranking-row__position">{index + 1}</span>
                  <div>
                    <strong>{item.tagNumber}</strong>
                    <span>{item.cattleId}</span>
                  </div>
                  <meter min={0} max={100} value={item.riskScore} aria-label={t('riskAriaLabel', { tagNumber: item.tagNumber })} />
                  <strong>{formatNumber(item.riskScore)}</strong>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h2>{t('trendTitle')}</h2>
              <p>{t('trendSubtitle')}</p>
            </div>
          </div>
          {data.trend.length === 0 ? <UiState title={t('trendEmptyTitle')} description={t('trendEmptyDescription')} /> : <TrendChart trend={data.trend} />}
        </article>
      </section>
    </div>
  );
}

function TrendChart({ trend }: { trend: DashboardTrendItem[] }) {
  const { t } = useTranslation('dashboard');
  const maxValue = Math.max(1, ...trend.map((item) => Math.max(item.events, item.alerts)));

  return (
    <div className="trend-chart" role="img" aria-label={t('trendChartAriaLabel')}>
      {trend.map((item) => (
        <div className="trend-chart__group" key={item.date}>
          <div className="trend-chart__bars">
            <span
              className="trend-chart__bar trend-chart__bar--events"
              style={{ height: `${Math.max(8, (item.events / maxValue) * 100)}%` }}
              title={t('trendEventsTitle', { count: item.events })}
            />
            <span
              className="trend-chart__bar trend-chart__bar--alerts"
              style={{ height: `${Math.max(8, (item.alerts / maxValue) * 100)}%` }}
              title={t('trendAlertsTitle', { count: item.alerts })}
            />
          </div>
          <span>{formatDateLabel(item.date)}</span>
        </div>
      ))}
    </div>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 }).format(value);
}

function formatDateLabel(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(date);
}
