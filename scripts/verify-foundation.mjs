import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const mode = process.argv[2] ?? 'verify';
const requiredPaths = [
  'FOUNDATION.md',
  'backend/README.md',
  'frontend/README.md',
  'mobile/README.md',
  'desktop/README.md',
  'database/README.md',
  'database/mariadb/README.md',
  'database/sqlite/README.md',
  '.github/workflows/foundation-check.yml',
  'knowledge-base/99-meta/MASTER_INDEX.md',
  'knowledge-base/00-introduction/PROJECT_STRUCTURE.md',
  'knowledge-base/06-engineering/README.md',
  'knowledge-base/07-reference/directory-map.md',
  'knowledge-base/10-roadmap/phase-1-foundation.md',
  'knowledge-base/11-openspec/README.md'
];

const forbiddenPatterns = [
  /JWT_SECRET\s*=\s*(?!change-me|<|$).+/i,
  /password\s*=\s*(?!change-me|<|$).+/i,
  /BEGIN PRIVATE KEY/,
  /production secret/i
];

const missing = requiredPaths.filter((path) => !existsSync(join(process.cwd(), path)));

if (missing.length > 0) {
  console.error(`Foundation ${mode} check failed. Missing paths:`);
  for (const path of missing) {
    console.error(`- ${path}`);
  }
  process.exit(1);
}

const textFiles = [
  'FOUNDATION.md',
  'backend/.env.example',
  'frontend/.env.example',
  'database/README.md',
  'database/mariadb/seeds/README.md',
  'database/sqlite/seeds/README.md'
];

for (const path of textFiles) {
  const content = readFileSync(join(process.cwd(), path), 'utf8');
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      console.error(`Foundation ${mode} check failed. Possible secret in ${path}.`);
      process.exit(1);
    }
  }
}

console.log(`Foundation ${mode} check passed.`);
