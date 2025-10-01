/** @jest-config-loader ts-node */

import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.{svg,d}.{ts,tsx}',
  ],
  coverageDirectory: './coverage',
  coverageProvider: 'v8',
};

export default config;