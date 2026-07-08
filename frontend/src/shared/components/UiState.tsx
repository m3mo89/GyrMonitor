import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

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

export function LoadingState({ title }: { title?: string }) {
  const { t } = useTranslation('common');
  const resolvedTitle = title ?? t('loading.title');

  return (
    <section className="ui-state" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <div>
        <h2>{resolvedTitle}</h2>
        <p>{t('loading.description')}</p>
      </div>
    </section>
  );
}
