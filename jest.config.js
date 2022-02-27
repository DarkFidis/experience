const { resolve } = require('path')
const { name } = require('./package.json')
const coverageThreshold = {
  all: require('./coverage-threshold-all'),
  e2e: require('./coverage-threshold-e2e'),
  integration: require('./coverage-threshold-integration'),
  unit: require('./coverage-threshold-unit'),
}

const baseDir = __dirname

module.exports = {
  clearMocks: true,
  collectCoverageFrom: ['src/main/**/!(*.d)*.ts'],
  coverageDirectory: resolve(baseDir, 'dist', 'coverage', 'all'),
  coverageReporters: ['text', 'html'],
  coverageThreshold: { global: coverageThreshold },
  displayName: name,
  globalSetup: resolve(baseDir, 'jest-global-setup.js'),
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/tmp/'],
  preset: 'ts-jest',
  rootDir: baseDir,
  testEnvironment: 'node',
  testMatch: [resolve(baseDir, 'src', 'test', '{e2e,integration,unit}/**/*.test.ts')],
}
