import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    typecheck: {
      tsconfig: './tsconfig.test.json'
    },
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.spec.ts'],
          exclude: ['test/**/*.e2e-spec.ts']
        }
      },
      {
        test: {
          name: 'e2e',
          include: ['test/**/*.e2e-spec.ts']
        }
      }
    ]
  }
});
