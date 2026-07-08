import { BrowserRouter } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';

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
            <SpeedInsights />
          </AppQueryProvider>
        </AuthProvider>
      </BrowserRouter>
    </AppI18nProvider>
  );
}
