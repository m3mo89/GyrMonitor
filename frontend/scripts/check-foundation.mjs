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
  'src/features/dashboard/README.md',
  'src/features/cattle/README.md',
  'src/features/events/README.md',
  'src/features/alerts/README.md',
  'src/features/metrics/README.md',
  'src/shared/components/README.md',
  'src/shared/hooks/README.md',
  'src/shared/services/README.md',
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

console.log(`Frontend ${mode} check passed.`);
