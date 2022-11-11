import { Logger } from 'winston'

import { cluster as clusterConfig } from '../../main/config'

describe('master unit tests', () => {
  let Cluster: jest.Mock
  let log: jest.Mocked<Logger>
  let runWorker: jest.Mock
  let run: jest.Mock
  let spyClusterConstructor: jest.SpyInstance
  let processOnMock: jest.SpyInstance
  beforeAll(() => {
    jest.doMock('../../main/utils/cluster')
    ;({ Cluster } = require('../../main/utils/cluster'))
    jest.doMock('../../main/log')
    ;({ log } = require('../../main/log'))
    jest.doMock('../../main/services/web-server')
    jest.doMock('../../main/worker')
    ;({ run: runWorker } = require('../../main/worker'))
    ;({ run } = require('../../main/master'))
    spyClusterConstructor = jest.spyOn(Cluster.prototype, 'constructor').mockImplementation()
    processOnMock = jest.spyOn(process, 'on').mockImplementation()
  })
  afterAll(() => {
    processOnMock.mockRestore()
    spyClusterConstructor.mockRestore()
  })
  test('should run the cluster', () => {
    // Given
    const cluster = new Cluster()
    processOnMock.mockImplementation((__, listener) => {
      listener()
      expect(cluster.reload).toHaveBeenCalled()
    })
    spyClusterConstructor.mockImplementation(() => cluster)
    // When
    run()
    // Then
    expect(spyClusterConstructor).toHaveBeenCalledWith(log)
    expect(cluster.clusterize).toHaveBeenCalledWith(runWorker, clusterConfig)
  })
})
