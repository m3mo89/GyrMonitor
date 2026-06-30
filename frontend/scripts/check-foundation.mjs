import { existsSync } from 'node:fs';
import { join } from 'node:path';

const mode = process.argv[2] ?? 'verify';
const root = process.cwd();
const required = [
  'README.md',
  '.env.example',
  'index.html',
  'tsconfig.json',
  'vite.config.ts',
  'src/main.tsx',
  'src/app/App.tsx',
  'src/app/router/README.md',
  'src/app/providers/README.md',
  'src/app/layouts/README.md',
  'src/features/auth/README.md',
  'src/features/auth/AuthProvider.tsx',
  'src/features/auth/LoginPage.tsx',
  'src/features/auth/ProtectedRoute.tsx',
  'src/features/auth/auth.api.ts',
  'src/features/auth/auth.types.ts',
  'src/features/auth/session-store.ts',
  'src/features/dashboard/README.md',
  'src/features/cattle/README.md',
  'src/features/cattle/CattleDetailPage.tsx',
  'src/features/cattle/CattleListPage.tsx',
  'src/features/cattle/cattle.api.ts',
  'src/features/cattle/cattle.types.ts',
  'src/features/events/README.md',
  'src/features/alerts/README.md',
  'src/features/metrics/README.md',
  'src/shared/components/README.md',
  'src/shared/hooks/README.md',
  'src/shared/services/README.md',
  'src/shared/services/api-client.ts',
  'src/shared/types/README.md',
  'src/shared/utils/README.md'
];

const missing = required.filter((path) => !existsSync(join(root, path)));

if (missing.length > 0) {
  console.error(`Frontend ${mode} check failed. Missing paths:`);
  for (const path of missing) {
    console.error(`- ${path}`);
  }
  process.exit(1);
}

if (mode === 'test') {
  await import('./check-authentication.mjs');
  await import('./check-cattle-management.mjs');
}

console.log(`Frontend ${mode} check passed.`);
