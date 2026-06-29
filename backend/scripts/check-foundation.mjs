import { existsSync } from 'node:fs';
import { join } from 'node:path';

const mode = process.argv[2] ?? 'verify';
const root = process.cwd();
const required = [
  'README.md',
  '.env.example',
  'nest-cli.json',
  'tsconfig.json',
  'src/main.ts',
  'src/app.module.ts',
  'src/config/app.config.ts',
  'src/shared/README.md',
  'src/authentication/README.md',
  'src/cattle-monitoring/README.md',
  'src/activity-events/README.md',
  'src/inactivity-analysis/README.md',
  'src/alerts/README.md',
  'src/inspections/README.md',
  'src/dashboard/README.md',
  'src/offline-sync/README.md'
];

const missing = required.filter((path) => !existsSync(join(root, path)));

if (missing.length > 0) {
  console.error(`Backend ${mode} check failed. Missing paths:`);
  for (const path of missing) {
    console.error(`- ${path}`);
  }
  process.exit(1);
}

console.log(`Backend ${mode} check passed.`);
