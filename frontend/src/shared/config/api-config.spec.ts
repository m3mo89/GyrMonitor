import { describe, expect, it, vi } from 'vitest';

import {
  defaultLocalApiBaseUrl,
  isLikelyDeployedWithLocalApiBaseUrl,
  isProductionBuildMisconfigured,
  productionApiBaseUrl,
  resolveApiBaseUrl,
  stagingApiBaseUrl,
  warnIfApiBaseUrlLooksMisconfigured
} from './api-config';

describe('api-config', () => {
  it('uses the local API default when no Vite API base URL is configured', () => {
    expect(resolveApiBaseUrl({})).toBe(defaultLocalApiBaseUrl);
  });

  it('uses the staging Railway API URL when configured', () => {
    expect(resolveApiBaseUrl({ VITE_API_BASE_URL: stagingApiBaseUrl })).toBe(stagingApiBaseUrl);
  });

  it('detects deployed builds that still point at localhost', () => {
    expect(
      isLikelyDeployedWithLocalApiBaseUrl(
        { PROD: true, VITE_API_BASE_URL: 'http://127.0.0.1:3000/api/v1' },
        'https://gyr-monitor-staging.vercel.app'
      )
    ).toBe(true);
  });

  it('allows local development to use the local API default', () => {
    expect(isLikelyDeployedWithLocalApiBaseUrl({ PROD: true }, 'http://localhost:5173')).toBe(false);
  });

  it('warns when a deployed build uses the local fallback', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    warnIfApiBaseUrlLooksMisconfigured({ PROD: true }, 'https://gyr-monitor-staging.vercel.app');

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('VITE_API_BASE_URL'));
    warn.mockRestore();
  });

  it('detects production builds that reuse the staging API URL', () => {
    expect(isProductionBuildMisconfigured({ MODE: 'production', VITE_API_BASE_URL: stagingApiBaseUrl })).toBe(true);
  });

  it('accepts production builds with an explicit non-local, non-staging API URL', () => {
    expect(
      isProductionBuildMisconfigured({
        MODE: 'production',
        VITE_API_BASE_URL: productionApiBaseUrl
      })
    ).toBe(false);
  });

  it('detects production builds that use an unexpected production API URL', () => {
    expect(
      isProductionBuildMisconfigured({
        MODE: 'production',
        VITE_API_BASE_URL: 'https://unexpected.example/api/v1'
      })
    ).toBe(true);
  });
});
