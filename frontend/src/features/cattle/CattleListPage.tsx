import { useEffect, useState } from 'react';

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
    return (
      <main>
        <h1>Cattle</h1>
        <p>Cargando cattle...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Cattle</h1>
        <p role="alert">{error}</p>
      </main>
    );
  }

  if (!result || result.data.length === 0) {
    return (
      <main>
        <h1>Cattle</h1>
        <p>No hay cattle registrados para mostrar.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Cattle</h1>
      <p>Total: {result.pagination.total} cattle registrados</p>
      <table>
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
              <td>{cattle.tagNumber}</td>
              <td>{cattle.breed}</td>
              <td>{cattle.sex}</td>
              <td>{cattle.status}</td>
              <td>{cattle.lastRiskScore ?? 'N/A'}</td>
              <td>
                <button onClick={() => onOpenCattle(cattle.id)} type="button">
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
