import { useEffect, useState } from 'react';

import { useAuth } from '../auth/AuthProvider';
import { getCattleDetail, getCattleHistory } from './cattle.api';
import type { CattleDetail, CattleHistoryPlaceholder } from './cattle.types';

type CattleDetailPageProps = {
  cattleId: string;
  onBackToList(): void;
};

export function CattleDetailPage({ cattleId, onBackToList }: CattleDetailPageProps) {
  const { apiClient } = useAuth();
  const [cattle, setCattle] = useState<CattleDetail | null>(null);
  const [history, setHistory] = useState<CattleHistoryPlaceholder | null>(null);
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
      <main>
        <button onClick={onBackToList} type="button">
          Volver
        </button>
        <h1>Cattle</h1>
        <p>Cargando detalle...</p>
      </main>
    );
  }

  if (error || !cattle) {
    return (
      <main>
        <button onClick={onBackToList} type="button">
          Volver
        </button>
        <h1>Cattle</h1>
        <p role="alert">{error ?? 'No se encontro el cattle solicitado.'}</p>
      </main>
    );
  }

  return (
    <main>
      <button onClick={onBackToList} type="button">
        Volver
      </button>
      <h1>{cattle.tagNumber}</h1>
      <dl>
        <dt>Breed</dt>
        <dd>{cattle.breed}</dd>
        <dt>Sex</dt>
        <dd>{cattle.sex}</dd>
        <dt>Status</dt>
        <dd>{cattle.status}</dd>
        <dt>Birth date</dt>
        <dd>{cattle.birthDate ?? 'N/A'}</dd>
        <dt>Risk</dt>
        <dd>{cattle.lastRiskScore ?? 'N/A'}</dd>
      </dl>
      <section aria-label="Cattle history">
        <h2>History</h2>
        <p>{history?.message ?? 'Cattle history is reserved for the activity-events phase.'}</p>
        <p>{history?.pagination.total ?? 0} events available.</p>
      </section>
    </main>
  );
}

function isNotFound(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as { error?: { code?: string }; statusCode?: number };
  return maybeError.error?.code === 'NOT_FOUND' || maybeError.statusCode === 404;
}
