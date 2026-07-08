import { BrowserRouter } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';

import { AppQueryProvider } from './providers/QueryProvider';
import { AppRouter } from './router/AppRouter';
import { AuthProvider } from '../features/auth/AuthProvider';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppQueryProvider>
          <AppRouter />
          <SpeedInsights />
        </AppQueryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
