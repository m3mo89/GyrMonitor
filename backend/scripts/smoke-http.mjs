import { spawn } from 'node:child_process';

const port = process.env.SMOKE_BACKEND_PORT ?? '3011';
const host = process.env.BACKEND_HOST ?? '127.0.0.1';
const apiPrefix = process.env.API_PREFIX ?? '/api/v1';
const url = `http://${host}:${port}${apiPrefix}`;
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
  const response = await waitForAvailability();
  await assertAvailabilityResponse(response);
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
