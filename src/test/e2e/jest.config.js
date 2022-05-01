const { resolve } = require('path')
const coverageThresholds = require('../../../coverage-threshold-e2e.json')
const jestBaseConfig = require('../../../jest.config')

const baseDir = resolve(__dirname, '..', '..', '..')

module.exports = {
  ...jestBaseConfig,
  coverageDirectory: resolve(baseDir, 'dist', 'coverage', 'e2e'),
  coverageThreshold: { global: coverageThresholds },
  testMatch: [resolve(baseDir, 'src', 'test', 'e2e', '**/*.test.ts')],
  testTimeout: 10000,
}
