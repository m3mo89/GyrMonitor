import type { ReactNode } from 'react';

type UiStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: 'neutral' | 'danger' | 'warning';
};

export function UiState({ title, description, action, tone = 'neutral' }: UiStateProps) {
  return (
    <section className={`ui-state ui-state--${tone}`} aria-live={tone === 'danger' ? 'assertive' : 'polite'}>
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="ui-state__action">{action}</div> : null}
    </section>
  );
}

export function LoadingState({ title = 'Cargando informacion...' }: { title?: string }) {
  return (
    <section className="ui-state" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <div>
        <h2>{title}</h2>
        <p>Estamos consultando los datos operativos mas recientes.</p>
      </div>
    </section>
  );
}
