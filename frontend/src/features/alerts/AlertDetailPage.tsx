import { useEffect, useState } from 'react';

import { LoadingState, UiState } from '../../shared/components/UiState';
import { useAuth } from '../auth/AuthProvider';
import { getAlertDetail, updateAlertStatus } from './alerts.api';
import type { AlertDetail, AlertStatus } from './alert.types';
import { severityClass, statusClass } from './AlertsListPage';

type AlertDetailPageProps = {
  alertId: string;
  onBackToList(): void;
  onOpenCattle(id: string): void;
};

export function AlertDetailPage({ alertId, onBackToList, onOpenCattle }: AlertDetailPageProps) {
  const { apiClient, session } = useAuth();
  const [alert, setAlert] = useState<AlertDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadAlert() {
      setIsLoading(true);
      setError(null);

      try {
        const nextAlert = await getAlertDetail(apiClient, alertId);
        if (isCurrent) {
          setAlert(nextAlert);
        }
      } catch {
        if (isCurrent) {
          setAlert(null);
          setError('No se pudo cargar el detalle de la alerta.');
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadAlert();

    return () => {
      isCurrent = false;
    };
  }, [apiClient, alertId]);

  async function changeStatus(status: AlertStatus) {
    setIsUpdating(true);
    setError(null);

    try {
      const updated = await updateAlertStatus(apiClient, alertId, status);
      setAlert((current) => (current ? { ...current, status: updated.status, attendedAt: updated.attendedAt } : current));
    } catch {
      setError('No se pudo actualizar el estado de la alerta.');
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="page-stack">
        <button className="button" onClick={onBackToList} type="button">
          Volver
        </button>
        <LoadingState title="Cargando alerta..." />
      </div>
    );
  }

  if (error && !alert) {
    return (
      <div className="page-stack">
        <button className="button" onClick={onBackToList} type="button">
          Volver
        </button>
        <UiState title="No se pudo cargar la alerta" description={error} tone="danger" />
      </div>
    );
  }

  if (!alert) {
    return <UiState title="Alerta no encontrada" description="No encontramos la alerta solicitada." tone="danger" />;
  }

  const canUpdate = session?.user.role === 'ADMIN' || session?.user.role === 'FIELD_OPERATOR';

  return (
    <div className="page-stack">
      <div className="button-row">
        <button className="button" onClick={onBackToList} type="button">
          Volver
        </button>
        <button className="button" onClick={() => onOpenCattle(alert.cattleId)} type="button">
          Ver cattle
        </button>
      </div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Detalle alerta</p>
          <h1>{alert.tagNumber ?? alert.cattleId}</h1>
          <p>{alert.reason}</p>
        </div>
        <span className={statusClass(alert.status)}>{alert.status}</span>
      </header>
      {error ? <UiState title="Actualizacion no aplicada" description={error} tone="danger" /> : null}
      <dl className="detail-grid">
        <div className="detail-item">
          <dt>Severity</dt>
          <dd>
            <span className={severityClass(alert.severity)}>{alert.severity}</span>
          </dd>
        </div>
        <div className="detail-item">
          <dt>Risk score</dt>
          <dd>{alert.riskScore}</dd>
        </div>
        <div className="detail-item">
          <dt>Created at</dt>
          <dd>{formatDateTime(alert.createdAt)}</dd>
        </div>
        <div className="detail-item">
          <dt>Attended at</dt>
          <dd>{alert.attendedAt ? formatDateTime(alert.attendedAt) : 'N/A'}</dd>
        </div>
        <div className="detail-item">
          <dt>Event id</dt>
          <dd>{alert.eventId ?? 'N/A'}</dd>
        </div>
        <div className="detail-item">
          <dt>Cattle id</dt>
          <dd>{alert.cattleId}</dd>
        </div>
      </dl>
      {canUpdate ? (
        <section className="panel">
          <div className="panel__header">
            <div>
              <h2>Actualizar estado</h2>
              <p>Aplica las transiciones permitidas por el backend.</p>
            </div>
          </div>
          <div className="button-row">
            <button className="button" disabled={isUpdating || alert.status !== 'PENDING'} onClick={() => void changeStatus('IN_PROGRESS')} type="button">
              Marcar en progreso
            </button>
            <button className="button button--primary" disabled={isUpdating || alert.status === 'ATTENDED'} onClick={() => void changeStatus('ATTENDED')} type="button">
              Marcar atendida
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}
