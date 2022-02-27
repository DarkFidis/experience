const e2e = require('./coverage-threshold-e2e.json')
const integration = require('./coverage-threshold-integration.json')
const unit = require('./coverage-threshold-unit.json')

module.exports = {
  branches: Math.max(e2e.branches, integration.branches, unit.branches),
  functions: Math.max(e2e.functions, integration.functions, unit.functions),
  lines: Math.max(e2e.lines, integration.lines, unit.lines),
  statements: Math.max(e2e.statements, integration.statements, unit.statements),
}
