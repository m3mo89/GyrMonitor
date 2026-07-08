import { useTranslation } from 'react-i18next';

import { UiState } from '../../../shared/components/UiState';
import { useAuth } from './AuthProvider';

export function SystemGeneratorMessage() {
  const { t } = useTranslation('auth');
  const { clearSession } = useAuth();

  return (
    <UiState
      title={t('systemGenerator.title')}
      description={t('systemGenerator.description')}
      tone="warning"
      action={
        <button className="button button--primary" onClick={clearSession} type="button">
          {t('systemGenerator.closeSession')}
        </button>
      }
    />
  );
}
