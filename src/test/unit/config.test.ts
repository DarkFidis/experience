import { IConfig } from 'config'
import { when } from 'jest-when'

describe('Config file unit tests', () => {
  let nodeConfig: jest.Mocked<IConfig>
  beforeAll(() => {
    jest.doMock('config')
    nodeConfig = require('config')
  })
  afterEach(() => {
    jest.resetModules()
  })
  it('should retrieve all config options', () => {
    // Given
    const clusterConfig = { workers: 0 }
    when(nodeConfig.has).calledWith('cluster').mockReturnValue(true)
    when(nodeConfig.get).calledWith('cluster').mockReturnValue(clusterConfig)
    const logConfig = { name: 'Express-template' }
    when(nodeConfig.has).calledWith('log').mockReturnValue(true)
    when(nodeConfig.get).calledWith('log').mockReturnValue(logConfig)
    // When
    const { cluster, log } = require('../../main/config')
    // Then
    expect(nodeConfig.has).toHaveBeenNthCalledWith(1, 'cluster')
    expect(nodeConfig.get).toHaveBeenNthCalledWith(1, 'cluster')
    expect(nodeConfig.has).toHaveBeenNthCalledWith(2, 'log')
    expect(nodeConfig.get).toHaveBeenNthCalledWith(2, 'log')
    expect(cluster).toStrictEqual(clusterConfig)
    expect(log).toStrictEqual(logConfig)
  })
  it('should retrieve all default config options', () => {
    // Given
    const clusterConfig = { workers: 0 }
    const logConfig = { name: 'Express-template' }
    when(nodeConfig.has).calledWith('cluster').mockReturnValue(false)
    when(nodeConfig.has).calledWith('log').mockReturnValue(false)
    // When
    const { cluster, log } = require('../../main/config')
    // Then
    expect(nodeConfig.get).not.toHaveBeenCalled()
    expect(cluster).toStrictEqual(clusterConfig)
    expect(log).toStrictEqual(logConfig)
  })
})
