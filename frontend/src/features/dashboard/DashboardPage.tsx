import { LoadingState, UiState } from '../../shared/components/UiState';
import { useDashboardMetrics } from './useDashboardMetrics';
import type { DashboardMetrics, DashboardTrendItem } from './dashboard.types';

const metricConfig: Array<{
  key: keyof Pick<DashboardMetrics, 'totalCattle' | 'activeAlerts' | 'averageRiskScore' | 'highRiskCattle' | 'eventsToday' | 'syncPendingCount'>;
  label: string;
  hint: string;
  tone?: 'default' | 'attention' | 'success';
}> = [
  { key: 'totalCattle', label: 'Cattle total', hint: 'Registros activos para monitoreo', tone: 'success' },
  { key: 'activeAlerts', label: 'Alertas activas', hint: 'Pendientes o en progreso', tone: 'attention' },
  { key: 'averageRiskScore', label: 'Riesgo promedio', hint: 'Calculado por backend' },
  { key: 'highRiskCattle', label: 'Alto riesgo', hint: 'Cattle con score elevado', tone: 'attention' },
  { key: 'eventsToday', label: 'Eventos hoy', hint: 'Actividad registrada en UTC' },
  { key: 'syncPendingCount', label: 'Sync pendiente', hint: 'Operaciones por sincronizar' }
];

export function DashboardPage() {
  const dashboard = useDashboardMetrics();
  const isShowingStaleData = dashboard.isError && Boolean(dashboard.data);

  if (dashboard.isLoading) {
    return <LoadingState title="Cargando dashboard..." />;
  }

  if (dashboard.isError && !dashboard.data) {
    return (
      <UiState
        title="No se pudo cargar el dashboard"
        description="Revisa la conexion o intenta nuevamente. No mostraremos metricas inventadas."
        tone="danger"
        action={
          <button className="button button--primary" onClick={() => void dashboard.refetch()} type="button">
            Reintentar
          </button>
        }
      />
    );
  }

  const data = dashboard.data;

  if (!data) {
    return <UiState title="Dashboard sin datos" description="Aun no hay informacion operativa para mostrar." />;
  }

  const isEmpty = data.totalCattle === 0 && data.activeAlerts === 0 && data.riskRanking.length === 0 && data.trend.length === 0;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Operacion ganadera</p>
          <h1>Dashboard</h1>
          <p>Visibilidad rapida de riesgo, actividad, alertas y sincronizacion.</p>
        </div>
        {isShowingStaleData ? <span className="status-badge status-badge--warning">Datos en cache</span> : <span className="status-badge">Actualizado</span>}
      </header>

      {isEmpty ? <UiState title="Sin actividad registrada" description="El sistema esta listo; las metricas apareceran cuando existan cattle, eventos o alertas." /> : null}

      <section className="metric-grid" aria-label="Metricas principales">
        {metricConfig.map((metric) => (
          <article className={`metric-card metric-card--${metric.tone ?? 'default'}`} key={metric.key}>
            <p>{metric.label}</p>
            <strong>{formatNumber(data[metric.key])}</strong>
            <span>{metric.hint}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h2>Ranking de riesgo</h2>
              <p>Cattle ordenado por score calculado en backend.</p>
            </div>
          </div>
          {data.riskRanking.length === 0 ? (
            <UiState title="Sin ranking disponible" description="Aun no hay scores de riesgo para comparar." />
          ) : (
            <div className="ranking-list">
              {data.riskRanking.map((item, index) => (
                <div className="ranking-row" key={item.cattleId}>
                  <span className="ranking-row__position">{index + 1}</span>
                  <div>
                    <strong>{item.tagNumber}</strong>
                    <span>{item.cattleId}</span>
                  </div>
                  <meter min={0} max={100} value={item.riskScore} aria-label={`Riesgo de ${item.tagNumber}`} />
                  <strong>{formatNumber(item.riskScore)}</strong>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h2>Tendencia</h2>
              <p>Eventos y alertas por fecha.</p>
            </div>
          </div>
          {data.trend.length === 0 ? <UiState title="Sin tendencia" description="No hay eventos o alertas en el periodo consultado." /> : <TrendChart trend={data.trend} />}
        </article>
      </section>
    </div>
  );
}

function TrendChart({ trend }: { trend: DashboardTrendItem[] }) {
  const maxValue = Math.max(1, ...trend.map((item) => Math.max(item.events, item.alerts)));

  return (
    <div className="trend-chart" role="img" aria-label="Grafica de tendencia de eventos y alertas">
      {trend.map((item) => (
        <div className="trend-chart__group" key={item.date}>
          <div className="trend-chart__bars">
            <span className="trend-chart__bar trend-chart__bar--events" style={{ height: `${Math.max(8, (item.events / maxValue) * 100)}%` }} title={`${item.events} eventos`} />
            <span className="trend-chart__bar trend-chart__bar--alerts" style={{ height: `${Math.max(8, (item.alerts / maxValue) * 100)}%` }} title={`${item.alerts} alertas`} />
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
