import { useEffect, useState } from 'react';

import { LoadingState, UiState } from '../../shared/components/UiState';
import { useAuth } from '../auth/AuthProvider';
import { listAlerts } from './alerts.api';
import type { AlertListResult } from './alert.types';

type AlertsListPageProps = {
  onOpenAlert(id: string): void;
};

export function AlertsListPage({ onOpenAlert }: AlertsListPageProps) {
  const { apiClient } = useAuth();
  const [result, setResult] = useState<AlertListResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadAlerts() {
      setIsLoading(true);
      setError(null);

      try {
        const nextResult = await listAlerts(apiClient);
        if (isCurrent) {
          setResult(nextResult);
        }
      } catch {
        if (isCurrent) {
          setResult(null);
          setError('No se pudo cargar el listado de alertas.');
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadAlerts();

    return () => {
      isCurrent = false;
    };
  }, [apiClient]);

  if (isLoading) {
    return <LoadingState title="Cargando alertas..." />;
  }

  if (error) {
    return <UiState title="No se pudieron cargar las alertas" description={error} tone="danger" />;
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

export function statusClass(status: string): string {
  if (status === 'ATTENDED') {
    return 'status-badge';
  }

  if (status === 'IN_PROGRESS') {
    return 'status-badge status-badge--warning';
  }

  return 'status-badge status-badge--danger';
}

export function severityClass(severity: string): string {
  if (severity === 'HIGH') {
    return 'status-badge status-badge--danger';
  }

  if (severity === 'MEDIUM') {
    return 'status-badge status-badge--warning';
  }

  return 'status-badge';
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}
