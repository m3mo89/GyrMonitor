import { BrowserRouter } from 'react-router-dom';

import { AppI18nProvider } from './providers/I18nProvider';
import { AppQueryProvider } from './providers/QueryProvider';
import { AppRouter } from './router/AppRouter';
import { AuthProvider } from '../features/auth';

export function App() {
  return (
    <AppI18nProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppQueryProvider>
            <AppRouter />
          </AppQueryProvider>
        </AuthProvider>
      </BrowserRouter>
    </AppI18nProvider>
  );
}
