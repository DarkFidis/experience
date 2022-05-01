const { resolve } = require('path')
const coverageThresholds = require('../../../coverage-threshold-integration.json')
const jestBaseConfig = require('../../../jest.config')

const baseDir = resolve(__dirname, '..', '..', '..')

module.exports = {
  ...jestBaseConfig,
  coverageDirectory: resolve(baseDir, 'dist', 'coverage', 'integration'),
  coverageThreshold: { global: coverageThresholds },
  testMatch: [resolve(baseDir, 'src', 'test', 'integration', '**/*.test.ts')],
}
