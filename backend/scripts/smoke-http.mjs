import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const port = process.env.SMOKE_BACKEND_PORT ?? '3011';
const host = process.env.BACKEND_HOST ?? '127.0.0.1';
const apiPrefix = process.env.API_PREFIX ?? '/api/v1';
const url = `http://${host}:${port}${apiPrefix}`;
const deepDatabaseSmoke = process.env.SMOKE_WITH_DATABASE === 'true';
const smokeCorsOrigin = process.env.SMOKE_CORS_ORIGIN;
const timeoutMs = 10_000;
const intervalMs = 250;

let childOutput = '';

const child = spawn(process.execPath, ['dist/main.js'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    BACKEND_PORT: port,
    BACKEND_HOST: host,
    API_PREFIX: apiPrefix,
    CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS ?? smokeCorsOrigin,
    NODE_ENV: 'test'
  },
  stdio: ['ignore', 'pipe', 'pipe']
});

child.stdout.on('data', (chunk) => {
  childOutput += chunk.toString();
});

child.stderr.on('data', (chunk) => {
  childOutput += chunk.toString();
});

let childExit;
child.once('exit', (code, signal) => {
  childExit = { code, signal };
});

try {
  if (deepDatabaseSmoke) {
    await prepareDatabase();
  }

  const response = await waitForAvailability();
  await assertAvailabilityResponse(response);
  if (smokeCorsOrigin) {
    await assertCorsPreflight(smokeCorsOrigin);
  }
  if (deepDatabaseSmoke) {
    await assertAlertWorkflow();
    await assertInvalidLogin();
  } else {
    await assertProtectedAlertRoutes();
  }
  console.log(`Backend HTTP smoke check passed at ${url}.`);
} catch (error) {
  console.error('Backend HTTP smoke check failed.');
  console.error(error instanceof Error ? error.message : String(error));

  if (childOutput.trim()) {
    console.error(childOutput.trim());
  }

  process.exitCode = 1;
} finally {
  await stopChild();
}

async function waitForAvailability() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (childExit) {
      throw new Error(`Backend exited before serving HTTP. code=${childExit.code} signal=${childExit.signal}`);
    }

    try {
      const response = await fetch(url);

      if (response.ok) {
        return response;
      }
    } catch {
      // Retry until the process is ready or the timeout expires.
    }

    await delay(intervalMs);
  }

  throw new Error(`Timed out waiting for ${url}.`);
}

async function assertAvailabilityResponse(response) {
  const body = await response.json();

  if (body?.success !== true || body?.data?.status !== 'ok') {
    throw new Error(`Unexpected availability response: ${JSON.stringify(body)}`);
  }

  const serialized = JSON.stringify(body).toLowerCase();
  const forbidden = ['secret', 'token', 'database_url', 'databaseurl', 'mysql://'];
  const leaked = forbidden.find((value) => serialized.includes(value));

  if (leaked) {
    throw new Error(`Availability response exposed forbidden value marker: ${leaked}`);
  }
}

async function assertProtectedAlertRoutes() {
  const response = await fetch(`${url}/alerts`);
  if (response.status !== 401) {
    throw new Error(`Expected unauthenticated alerts request to return 401, got ${response.status}.`);
  }
}

async function assertCorsPreflight(origin) {
  const response = await fetch(`${url}/auth/login`, {
    method: 'OPTIONS',
    headers: {
      origin,
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type'
    }
  });

  if (!response.ok) {
    throw new Error(`Expected CORS preflight for ${origin} to succeed, got ${response.status}.`);
  }

  const allowedOrigin = response.headers.get('access-control-allow-origin');
  if (allowedOrigin !== origin) {
    throw new Error(`Expected CORS allow-origin ${origin}, got ${allowedOrigin ?? '<missing>'}.`);
  }
}

async function assertAlertWorkflow() {
  const adminToken = await login('admin@gyrmonitor.local', 'local-admin-password');
  const systemToken = await login('system@gyrmonitor.local', 'local-system-password');
  const eventId = '30000000-0000-4000-8000-000000000097';

  const eventResponse = await requestJson(`${url}/events`, {
    method: 'POST',
    token: systemToken,
    body: {
      eventId,
      deviceId: 'smoke-device',
      cattleId: '10000000-0000-4000-8000-000000000003',
      eventType: 'INACTIVITY',
      inactiveMinutes: 90,
      confidence: 0.95,
      capturedAt: '2026-06-30T11:00:00.000Z',
      source: 'CONTROLLED_TEST_DATA'
    }
  });

  if (eventResponse.status !== 201 || eventResponse.body?.data?.alertGenerated !== true || !eventResponse.body?.data?.alertId) {
    throw new Error(`Expected event smoke request to generate alert: ${JSON.stringify(eventResponse.body)}`);
  }

  const alertId = eventResponse.body.data.alertId;
  const listResponse = await requestJson(`${url}/alerts?status=PENDING&severity=HIGH&cattleId=10000000-0000-4000-8000-000000000003`, {
    token: adminToken
  });
  if (listResponse.status !== 200 || !listResponse.body?.data?.some((record) => record.id === alertId)) {
    throw new Error(`Expected generated alert to be listable: ${JSON.stringify(listResponse.body)}`);
  }

  const detailResponse = await requestJson(`${url}/alerts/${alertId}`, { token: adminToken });
  if (detailResponse.status !== 200 || detailResponse.body?.data?.eventId !== eventId) {
    throw new Error(`Expected generated alert detail to preserve event traceability: ${JSON.stringify(detailResponse.body)}`);
  }
}

async function assertInvalidLogin() {
  const response = await requestJson(`${url}/auth/login`, {
    method: 'POST',
    body: { email: 'admin@gyrmonitor.local', password: 'definitely-wrong' }
  });

  if (response.status !== 401 || response.body?.error?.code !== 'UNAUTHORIZED') {
    throw new Error(`Expected invalid login to return UNAUTHORIZED: ${JSON.stringify(response.body)}`);
  }
}

async function login(email, password) {
  const response = await requestJson(`${url}/auth/login`, {
    method: 'POST',
    body: { email, password }
  });

  if (response.status !== 201 || !response.body?.data?.accessToken) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(response.body)}`);
  }

  return response.body.data.accessToken;
}

async function requestJson(endpoint, options = {}) {
  const headers = {
    accept: 'application/json',
    ...(options.body ? { 'content-type': 'application/json' } : {}),
    ...(options.token ? { authorization: `Bearer ${options.token}` } : {})
  };
  const response = await fetch(endpoint, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : undefined;
  return { status: response.status, body };
}

async function prepareDatabase() {
  const { createConfiguredMariaDbClient } = require('../dist/database/mysql2-driver.js');
  const { runMigrations } = require('../dist/database/migrations.js');
  const { seedDatabase } = require('../dist/database/seeds.js');
  const client = createConfiguredMariaDbClient();

  try {
    await runMigrations(client);
    await seedDatabase(client);
  } finally {
    await client.close();
  }
}

async function stopChild() {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  child.kill('SIGTERM');

  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    delay(2_000).then(() => {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill('SIGKILL');
      }
    })
  ]);
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
