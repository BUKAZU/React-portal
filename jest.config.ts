/** @jest-config-loader ts-node */

import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/src/__mocks__/fileMock.ts',
    '\\.msgpack\\?url$': '<rootDir>/src/__mocks__/urlMock.ts'
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{ts,tsx}'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/__mocks__/**',
    '!src/**/*.{svg,d}.{ts,tsx}'
  ],
  coverageDirectory: './coverage',
  coverageProvider: 'v8',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  coverageThreshold: {
    // These values reflect the current measured baseline. Any PR that causes
    // overall coverage to drop below these floors will fail CI, ensuring that
    // new code is always covered. Raise these values as coverage improves.
    global: {
      lines: 89,
      statements: 89,
      functions: 82,
      branches: 87
    }
  },
  // Allow Babel to transform the ESM-only `ky` package so Jest (CommonJS)
  // can require it without a native ESM runner.
  transformIgnorePatterns: ['/node_modules/(?!(ky)/)']
};

export default config;
