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
    process.env = {
      MONGO_HOST: 'localhost',
      MONGO_PASSWORD: 'password',
      MONGO_USER: 'user',
    }
    const clusterConfig = { workers: 0 }
    when(nodeConfig.has).calledWith('cluster').mockReturnValue(true)
    when(nodeConfig.get).calledWith('cluster').mockReturnValue(clusterConfig)
    const logConfig = { level: 'debug', name: 'Express-template' }
    when(nodeConfig.has).calledWith('log').mockReturnValue(true)
    when(nodeConfig.get).calledWith('log').mockReturnValue(logConfig)
    const mongoConfiguration = {
      dbName: 'test',
    }
    when(nodeConfig.has).calledWith('mongo').mockReturnValue(true)
    when(nodeConfig.get).calledWith('mongo').mockReturnValue(mongoConfiguration)
    const { MONGO_HOST, MONGO_PASSWORD, MONGO_USER } = process.env
    const mongoConfig = {
      url: `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:27017/${mongoConfiguration.dbName}`,
    }
    // When
    const { cluster, log, mongo } = require('../../main/config')
    // Then
    expect(nodeConfig.has).toHaveBeenNthCalledWith(1, 'cluster')
    expect(nodeConfig.get).toHaveBeenNthCalledWith(1, 'cluster')
    expect(nodeConfig.has).toHaveBeenNthCalledWith(2, 'log')
    expect(nodeConfig.get).toHaveBeenNthCalledWith(2, 'log')
    expect(nodeConfig.has).toHaveBeenNthCalledWith(3, 'mongo')
    expect(nodeConfig.get).toHaveBeenNthCalledWith(3, 'mongo')
    expect(cluster).toStrictEqual(clusterConfig)
    expect(log).toStrictEqual(logConfig)
    expect(mongo).toStrictEqual(mongoConfig)
  })
  it('should retrieve all default config options', () => {
    // Given
    const clusterConfig = { workers: 0 }
    const logConfig = { level: 'debug', name: 'Express-template' }
    when(nodeConfig.has).calledWith('cluster').mockReturnValue(false)
    when(nodeConfig.has).calledWith('log').mockReturnValue(false)
    when(nodeConfig.has).calledWith('mongo').mockReturnValue(false)
    // When
    const { cluster, log } = require('../../main/config')
    // Then
    expect(nodeConfig.get).not.toHaveBeenCalled()
    expect(cluster).toStrictEqual(clusterConfig)
    expect(log).toStrictEqual(logConfig)
  })
  it('should retrieve mongo Url in production mode', () => {
    // Given
    process.env = {
      MONGO_HOST: 'localhost',
      MONGO_PASSWORD: 'password',
      MONGO_USER: 'user',
      NODE_ENV: 'production',
    }
    when(nodeConfig.has).calledWith('mongo').mockReturnValue(false)
    const { MONGO_HOST, MONGO_PASSWORD, MONGO_USER } = process.env
    const mongoConfig = {
      url: `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}/template`,
    }
    // When
    const { mongo } = require('../../main/config')
    // Then
    expect(mongo).toStrictEqual(mongoConfig)
  })
})
