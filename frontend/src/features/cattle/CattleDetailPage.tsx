import { useEffect, useState } from 'react';

import { LoadingState, UiState } from '../../shared/components/UiState';
import { useAuth } from '../auth/AuthProvider';
import { getCattleDetail, getCattleHistory } from './cattle.api';
import type { CattleDetail, CattleHistory } from './cattle.types';

type CattleDetailPageProps = {
  cattleId: string;
  onBackToList(): void;
};

export function CattleDetailPage({ cattleId, onBackToList }: CattleDetailPageProps) {
  const { apiClient } = useAuth();
  const [cattle, setCattle] = useState<CattleDetail | null>(null);
  const [history, setHistory] = useState<CattleHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadDetail() {
      setIsLoading(true);
      setError(null);

      try {
        const [nextCattle, nextHistory] = await Promise.all([
          getCattleDetail(apiClient, cattleId),
          getCattleHistory(apiClient, cattleId)
        ]);

        if (isCurrent) {
          setCattle(nextCattle);
          setHistory(nextHistory);
        }
      } catch (requestError) {
        if (isCurrent) {
          setCattle(null);
          setHistory(null);
          setError(isNotFound(requestError) ? 'No se encontro el cattle solicitado.' : 'No se pudo cargar el detalle de cattle.');
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadDetail();

    return () => {
      isCurrent = false;
    };
  }, [apiClient, cattleId]);

  if (isLoading) {
    return (
      <div className="page-stack">
        <button className="button" onClick={onBackToList} type="button">
          Volver
        </button>
        <LoadingState title="Cargando detalle..." />
      </div>
    );
  }

  if (error || !cattle) {
    return (
      <div className="page-stack">
        <button className="button" onClick={onBackToList} type="button">
          Volver
        </button>
        <UiState title="No se pudo cargar el detalle" description={error ?? 'No se encontro el cattle solicitado.'} tone="danger" />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="button-row">
        <button className="button" onClick={onBackToList} type="button">
          Volver
        </button>
      </div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Detalle cattle</p>
          <h1>{cattle.tagNumber}</h1>
          <p>Ficha resumida para consulta de estado, riesgo y trazabilidad.</p>
        </div>
        <span className="status-badge">{cattle.status}</span>
      </header>
      <dl className="detail-grid">
        <div className="detail-item">
          <dt>Breed</dt>
          <dd>{cattle.breed}</dd>
        </div>
        <div className="detail-item">
          <dt>Sex</dt>
          <dd>{cattle.sex}</dd>
        </div>
        <div className="detail-item">
          <dt>Birth date</dt>
          <dd>{cattle.birthDate ?? 'N/A'}</dd>
        </div>
        <div className="detail-item">
          <dt>Risk</dt>
          <dd>{cattle.lastRiskScore ?? 'N/A'}</dd>
        </div>
      </dl>
      <section className="panel" aria-label="Cattle history">
        <div className="panel__header">
          <div>
            <h2>History</h2>
            <p>Eventos reales registrados para este cattle.</p>
          </div>
          <span className="status-badge">{history?.pagination.total ?? 0} eventos</span>
        </div>
        {!history || history.events.length === 0 ? (
          <UiState title="Sin eventos registrados" description="Cuando existan eventos de actividad o inactividad para este cattle, apareceran aqui." />
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Captured at</th>
                  <th>Inactive</th>
                  <th>Confidence</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {history.events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <span className={event.eventType === 'INACTIVITY' ? 'status-badge status-badge--warning' : 'status-badge'}>{event.eventType}</span>
                    </td>
                    <td>{formatDateTime(event.capturedAt)}</td>
                    <td>{event.inactiveMinutes ?? 'N/A'}</td>
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

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function isNotFound(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as { error?: { code?: string }; statusCode?: number };
  return maybeError.error?.code === 'NOT_FOUND' || maybeError.statusCode === 404;
}
