import { BrowserRouter } from 'react-router-dom';

import { AppQueryProvider } from './providers/QueryProvider';
import { AppRouter } from './router/AppRouter';
import { AuthProvider } from '../features/auth/AuthProvider';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppQueryProvider>
          <AppRouter />
        </AppQueryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
