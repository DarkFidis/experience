const { resolve } = require('path')
const coverageThresholds = require('../../../coverage-threshold-unit.json')
const jestBaseConfig = require('../../../jest.config')

const baseDir = resolve(__dirname, '..', '..', '..')

module.exports = {
  ...jestBaseConfig,
  coverageDirectory: resolve(baseDir, 'dist', 'coverage', 'unit'),
  coverageThreshold: { global: coverageThresholds },
  testMatch: [resolve(baseDir, 'src', 'test', 'unit', '**/*.test.ts')],
}
