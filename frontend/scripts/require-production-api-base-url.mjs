const value = process.env.VITE_API_BASE_URL?.trim();
const stagingUrl = 'https://gyrmonitor-staging.up.railway.app/api/v1';
const productionUrl = 'https://gyrmonitor-production.up.railway.app/api/v1';

if (!value) {
  fail('VITE_API_BASE_URL is required for production builds.');
}

if (value.startsWith('http://127.0.0.1:') || value.startsWith('http://localhost:')) {
  fail('Production builds must not use a local API base URL.');
}

if (value === stagingUrl) {
  fail('Production builds must not use the staging API base URL.');
}

if (value !== productionUrl) {
  fail(`Production builds must use ${productionUrl}.`);
}

console.log(`Production API base URL configured: ${value}`);

function fail(message) {
  console.error(message);
  process.exit(1);
}
