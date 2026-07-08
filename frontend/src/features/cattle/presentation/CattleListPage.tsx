import { LoadingState, UiState } from '../../../shared/components/UiState';
import { useCattleList } from '../application';

type CattleListPageProps = {
  onOpenCattle(id: string): void;
};

export function CattleListPage({ onOpenCattle }: CattleListPageProps) {
  const { data: result, isLoading, isError } = useCattleList();

  if (isLoading) {
    return <LoadingState title="Cargando cattle..." />;
  }

  if (isError) {
    return <UiState title="No se pudo cargar cattle" description="No se pudo cargar el listado de cattle." tone="danger" />;
  }

  if (!result || result.data.length === 0) {
    return <UiState title="No hay cattle registrados" description="Cuando exista informacion del hato, aparecera aqui para consulta operativa." />;
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
