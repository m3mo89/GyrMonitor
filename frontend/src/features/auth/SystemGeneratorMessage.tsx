import { UiState } from '../../shared/components/UiState';
import { useAuth } from './AuthProvider';

export function SystemGeneratorMessage() {
  const { clearSession } = useAuth();

  return (
    <UiState
      title="Cuenta de integracion"
      description="SYSTEM_GENERATOR esta reservado para ingestion de eventos desde simulador, cliente desktop o datos controlados. Para revisar dashboard, cattle o alertas, cambia a una cuenta operativa."
      tone="warning"
      action={
        <button className="button button--primary" onClick={clearSession} type="button">
          Cerrar sesion
        </button>
      }
    />
  );
}
