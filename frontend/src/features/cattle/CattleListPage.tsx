import { useEffect, useState } from 'react';

import { LoadingState, UiState } from '../../shared/components/UiState';
import { useAuth } from '../auth/AuthProvider';
import { listCattle, type CattleListResult } from './cattle.api';

type CattleListPageProps = {
  onOpenCattle(id: string): void;
};

export function CattleListPage({ onOpenCattle }: CattleListPageProps) {
  const { apiClient } = useAuth();
  const [result, setResult] = useState<CattleListResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadCattle() {
      setIsLoading(true);
      setError(null);

      try {
        const nextResult = await listCattle(apiClient);

        if (isCurrent) {
          setResult(nextResult);
        }
      } catch {
        if (isCurrent) {
          setResult(null);
          setError('No se pudo cargar el listado de cattle.');
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadCattle();

    return () => {
      isCurrent = false;
    };
  }, [apiClient]);

  if (isLoading) {
    return <LoadingState title="Cargando cattle..." />;
  }

  if (error) {
    return (
      <UiState title="No se pudo cargar cattle" description={error} tone="danger" />
    );
  }

  if (!result || result.data.length === 0) {
    return (
      <UiState title="No hay cattle registrados" description="Cuando exista informacion del hato, aparecera aqui para consulta operativa." />
    );
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Hato</p>
          <h1>Cattle</h1>
          <p>{result.pagination.total} cattle registrados para seguimiento de riesgo y actividad.</p>
        </div>
      </header>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tag</th>
              <th>Breed</th>
              <th>Sex</th>
              <th>Status</th>
              <th>Risk</th>
              <th>Detalle</th>
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
                <td>{cattle.lastRiskScore ?? 'N/A'}</td>
                <td>
                  <button className="button" onClick={() => onOpenCattle(cattle.id)} type="button">
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
