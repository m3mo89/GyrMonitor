import { spawnSync } from 'node:child_process';

const stagingApiBaseUrl = 'https://gyrmonitor-staging.up.railway.app/api/v1';
const productionApiBaseUrl = 'https://gyrmonitor-production.up.railway.app/api/v1';

const requestedEnvironment = process.argv[2] ?? process.env.GYRMONITOR_ENV ?? inferEnvironment();
const config = resolveConfig(requestedEnvironment);
const env = {
  ...process.env,
  VITE_API_BASE_URL: config.apiBaseUrl
};

if (config.name === 'production' && config.apiBaseUrl !== productionApiBaseUrl) {
  fail(`Production builds must use ${productionApiBaseUrl}.`);
}

console.log(`Building frontend for ${config.name} with ${config.apiBaseUrl}.`);
run('tsc', ['-p', 'tsconfig.json'], env);
run('vite', ['build', '--mode', config.mode], env);

function inferEnvironment() {
  const vercelEnvironment = process.env.VERCEL_ENV;
  const branch = process.env.VERCEL_GIT_COMMIT_REF ?? process.env.GIT_BRANCH ?? '';

  if (vercelEnvironment === 'production') {
    return 'production';
  }

  if (branch === 'staging' || branch.endsWith('/staging')) {
    return 'staging';
  }

  return 'development';
}

function resolveConfig(value) {
  if (value === 'production' || value === 'prod') {
    return {
      name: 'production',
      mode: 'production',
      apiBaseUrl: productionApiBaseUrl
    };
  }

  if (value === 'staging' || value === 'stage') {
    return {
      name: 'staging',
      mode: 'staging',
      apiBaseUrl: stagingApiBaseUrl
    };
  }

  if (value === 'development' || value === 'local' || value === 'dev') {
    return {
      name: 'development',
      mode: 'development',
      apiBaseUrl: process.env.VITE_API_BASE_URL?.trim() || 'http://127.0.0.1:3000/api/v1'
    };
  }

  fail(`Unknown frontend build environment: ${value}`);
}

function run(command, args, commandEnv) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: commandEnv,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
