import { useState } from 'react';

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
  const { session } = useAuth();
  const { data: alert, isLoading: isAlertLoading, isError: isAlertError } = useAlertDetail(alertId);
  const { data: observations = [], isLoading: isObservationsLoading, isError: isObservationsError } = useAlertObservations(alertId);
  const updateAlertStatus = useUpdateAlertStatus(alertId);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const isLoading = isAlertLoading || isObservationsLoading;
  const error = isAlertError || isObservationsError ? 'No se pudo cargar el detalle de la alerta.' : null;
  const observationsError = isObservationsError && !isAlertError ? 'No se pudieron cargar las observaciones.' : null;

  async function changeStatus(status: AlertStatus) {
    setUpdateError(null);

    try {
      await updateAlertStatus.mutateAsync(status);
    } catch {
      setUpdateError('No se pudo actualizar el estado de la alerta.');
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

  const canUpdate = session?.user.role === Roles.ADMIN || session?.user.role === Roles.FIELD_OPERATOR;

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
      {updateError ? <UiState title="Actualizacion no aplicada" description={updateError} tone="danger" /> : null}
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
      <section className="panel">
        <div className="panel__header">
          <div>
            <h2>Observaciones</h2>
            <p>Notas registradas desde mobile o backend para esta alerta.</p>
          </div>
        </div>
        {observationsError ? <UiState title="No se pudieron cargar las observaciones" description={observationsError} tone="danger" /> : null}
        {observations.length === 0 ? (
          <UiState title="Sin observaciones" description="Todavia no hay observaciones sincronizadas para esta alerta." />
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
              <h2>Actualizar estado</h2>
              <p>Aplica las transiciones permitidas por el backend.</p>
            </div>
          </div>
          <div className="button-row">
            <button className="button" disabled={updateAlertStatus.isPending || alert.status !== 'PENDING'} onClick={() => void changeStatus('IN_PROGRESS')} type="button">
              Marcar en progreso
            </button>
            <button
              className="button button--primary"
              disabled={updateAlertStatus.isPending || alert.status === 'ATTENDED'}
              onClick={() => void changeStatus('ATTENDED')}
              type="button"
            >
              Marcar atendida
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
