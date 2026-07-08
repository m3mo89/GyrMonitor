export const defaultLocalApiBaseUrl = 'http://127.0.0.1:3000/api/v1';
export const stagingApiBaseUrl = 'https://gyrmonitor-staging.up.railway.app/api/v1';
export const productionApiBaseUrl = 'https://gyrmonitor-production.up.railway.app/api/v1';

export type ApiEnvironment = {
  VITE_API_BASE_URL?: string;
  MODE?: string;
  PROD?: boolean;
};

export function resolveApiBaseUrl(env: ApiEnvironment): string {
  return env.VITE_API_BASE_URL?.trim() || defaultLocalApiBaseUrl;
}

export function isLocalApiBaseUrl(value: string): boolean {
  return value.startsWith('http://127.0.0.1:') || value.startsWith('http://localhost:');
}

export function isStagingApiBaseUrl(value: string): boolean {
  return value === stagingApiBaseUrl;
}

export function isProductionBuild(env: ApiEnvironment): boolean {
  return env.MODE === 'production';
}

export function isLikelyDeployedWithLocalApiBaseUrl(env: ApiEnvironment, pageOrigin?: string): boolean {
  const apiBaseUrl = resolveApiBaseUrl(env);
  const isLocalPage = pageOrigin?.startsWith('http://127.0.0.1:') || pageOrigin?.startsWith('http://localhost:');

  return Boolean(env.PROD && !isLocalPage && isLocalApiBaseUrl(apiBaseUrl));
}

export function isProductionBuildMisconfigured(env: ApiEnvironment): boolean {
  if (!isProductionBuild(env)) {
    return false;
  }

  const apiBaseUrl = resolveApiBaseUrl(env);
  return isLocalApiBaseUrl(apiBaseUrl) || isStagingApiBaseUrl(apiBaseUrl) || apiBaseUrl !== productionApiBaseUrl;
}

export function warnIfApiBaseUrlLooksMisconfigured(env: ApiEnvironment, pageOrigin?: string): void {
  if (!isLikelyDeployedWithLocalApiBaseUrl(env, pageOrigin) && !isProductionBuildMisconfigured(env)) {
    return;
  }

  console.warn(
    'GyrMonitor frontend is running with an API base URL that does not match the deployment environment. Set VITE_API_BASE_URL and redeploy.'
  );
}
