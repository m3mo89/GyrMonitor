import { LoadingState, UiState } from '../../../shared/components/UiState';
import { formatDateTime } from '../../../shared/utils/format-date-time';
import { useAlertsList } from '../application';
import { severityClass, statusClass } from './alert-badges';

type AlertsListPageProps = {
  onOpenAlert(id: string): void;
};

export function AlertsListPage({ onOpenAlert }: AlertsListPageProps) {
  const { data: result, isLoading, isError } = useAlertsList();

  if (isLoading) {
    return <LoadingState title="Cargando alertas..." />;
  }

  if (isError) {
    return <UiState title="No se pudieron cargar las alertas" description="No se pudo cargar el listado de alertas." tone="danger" />;
  }

  if (!result || result.data.length === 0) {
    return <UiState title="Sin alertas" description="No hay alertas registradas para mostrar." />;
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Atencion operativa</p>
          <h1>Alertas</h1>
          <p>{result.pagination.total} alertas registradas con severidad, estado y trazabilidad.</p>
        </div>
      </header>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cattle</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Risk</th>
              <th>Reason</th>
              <th>Created</th>
              <th>Detalle</th>
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
                    Ver
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
