import { describe, expect, it } from 'vitest';

import { localDevelopmentCorsOrigins, readCorsAllowedOrigins } from './app.config';

describe('readCorsAllowedOrigins', () => {
  it('uses local development origins by default', () => {
    expect(readCorsAllowedOrigins(undefined)).toEqual(localDevelopmentCorsOrigins);
  });

  it('parses the staging frontend origin', () => {
    expect(readCorsAllowedOrigins('https://gyr-monitor-staging.vercel.app')).toEqual([
      'https://gyr-monitor-staging.vercel.app'
    ]);
  });

  it('parses multiple comma-separated origins', () => {
    expect(
      readCorsAllowedOrigins('https://gyr-monitor-staging.vercel.app, https://gyr-monitor.vercel.app')
    ).toEqual(['https://gyr-monitor-staging.vercel.app', 'https://gyr-monitor.vercel.app']);
  });

  it('falls back to local origins when the value is blank', () => {
    expect(readCorsAllowedOrigins(' ,  ')).toEqual(localDevelopmentCorsOrigins);
  });

  it('does not implicitly allow unconfigured origins', () => {
    const origins = readCorsAllowedOrigins('https://gyr-monitor-staging.vercel.app');

    expect(origins).not.toContain('https://unexpected.example');
    expect(origins).not.toContain('*');
  });
});
