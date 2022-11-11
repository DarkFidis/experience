import { Logger } from 'winston'

import { Clusterable, ClusterConfig } from '../../../main/types/cluster'
import { repeat } from '../../../main/utils/helper'

describe('cluster unit tests', () => {
  const cpusLength = 2
  describe('Cluster', () => {
    let log: jest.Mocked<Logger>
    let nodeCluster: {
      Worker: jest.Mock
      fork: jest.Mock
      on: jest.Mock
      isMaster: boolean
      setupMaster: jest.Mock
      workers: unknown
    }
    let openSync: jest.Mock
    let mkdirp: { sync: jest.Mock }
    let cpus: jest.Mock
    beforeAll(() => {
      jest.doMock('mkdirp')
      mkdirp = require('mkdirp')
      jest.doMock('cluster')
      nodeCluster = require('cluster')
      jest.doMock('../../../main/log')
      ;({ log } = require('../../../main/log'))
      jest.doMock('os')
      ;({ cpus } = require('os'))
      jest.doMock('fs')
      ;({ openSync } = require('fs'))
      cpus.mockReturnValue({ length: cpusLength })
    })
    test('should return Cluster class', () => {
      // When
      const Cluster = require('../../../main/utils/cluster').Cluster
      // Then
      expect(Cluster).toBeTruthy()
      expect(cpus).toHaveBeenCalledWith()
    })
    describe('instance', () => {
      let Cluster
      let cluster: Clusterable
      let worker
      beforeAll(() => {
        Cluster = require('../../../main/utils/cluster').Cluster
        cluster = new Cluster(log)
        worker = new nodeCluster.Worker('myworker')
        worker.process = { pid: 'mypid' }
        nodeCluster.fork.mockReturnValue(worker)
      })
      test('should return a cluster instance', () => {
        expect(cluster).toHaveProperty('_log', log)
      })
      describe('clusterize', () => {
        let spyLaunchWorker: jest.SpyInstance
        beforeAll(() => {
          spyLaunchWorker = jest.spyOn(Cluster.prototype, 'launchWorker').mockImplementation()
        })
        beforeEach(() => {
          nodeCluster.on.mockReset()
          jest.useFakeTimers()
        })
        afterEach(() => {
          jest.clearAllTimers()
        })
        afterAll(() => {
          jest.useRealTimers()
          spyLaunchWorker.mockRestore()
        })
        test('should execute master', () => {
          // Given
          nodeCluster.isMaster = true
          const fn = jest.fn()
          const clusterConfig: ClusterConfig = {}
          nodeCluster.on.mockImplementation((event, listener) => {
            if (event === 'fork') {
              listener(worker)
            } else if (event === 'online') {
              listener(worker)
            } else if (event === 'listening') {
              listener(worker, { address: 'myaddress', port: 'myport' })
            } else if (event === 'exit') {
              listener(worker, 1, 'SIGINT')
            }
          })
          // When
          cluster.clusterize(fn, clusterConfig)
          // Then
          expect(nodeCluster.setupMaster).toHaveBeenCalledWith({})
          expect(nodeCluster.on).toHaveBeenCalledWith('fork', expect.any(Function))
          expect(nodeCluster.on).toHaveBeenCalledWith('online', expect.any(Function))
          expect(nodeCluster.on).toHaveBeenCalledWith('listening', expect.any(Function))
          expect(nodeCluster.on).toHaveBeenCalledWith('exit', expect.any(Function))
          repeat(cpusLength, (index) => {
            jest.advanceTimersByTime(index * 3000)
            jest.runOnlyPendingTimers()
            expect(spyLaunchWorker).toHaveBeenNthCalledWith(index + 1, cpusLength)
          })
          expect(fn).not.toHaveBeenCalled()
        })
        test('should execute master and exit with code 0', () => {
          // Given
          nodeCluster.isMaster = true
          const fn = jest.fn()
          const clusterConfig: ClusterConfig = {}
          nodeCluster.on.mockImplementation((event, listener) => {
            if (event === 'fork') {
              listener(worker)
            } else if (event === 'online') {
              listener(worker)
            } else if (event === 'listening') {
              listener(worker, { address: 'myaddress', port: 'myport' })
            } else if (event === 'exit') {
              listener(worker, 0, 'SIGINT')
            }
          })
          // When
          cluster.clusterize(fn, clusterConfig)
          // Then
          expect(nodeCluster.setupMaster).toHaveBeenCalledWith({})
          expect(nodeCluster.on).toHaveBeenCalledWith('fork', expect.any(Function))
          expect(nodeCluster.on).toHaveBeenCalledWith('online', expect.any(Function))
          expect(nodeCluster.on).toHaveBeenCalledWith('listening', expect.any(Function))
          expect(nodeCluster.on).toHaveBeenCalledWith('exit', expect.any(Function))
          repeat(cpusLength, (index) => {
            jest.advanceTimersByTime(index * 3000)
            jest.runOnlyPendingTimers()
            expect(spyLaunchWorker).toHaveBeenNthCalledWith(index + 1, cpusLength)
          })
          expect(fn).not.toHaveBeenCalled()
        })
        test('should execute master with 3 workers', () => {
          // Given
          const workers = 3
          nodeCluster.isMaster = true
          const fn = jest.fn()
          const clusterConfig: ClusterConfig = { workers }
          // When
          cluster.clusterize(fn, clusterConfig)
          // Then
          repeat(workers, (index) => {
            jest.advanceTimersByTime(index * 3000)
            jest.runOnlyPendingTimers()
            expect(spyLaunchWorker).toHaveBeenNthCalledWith(index + 1, workers)
          })
        })
        test('should execute master with stdout log files', () => {
          // Given
          nodeCluster.isMaster = true
          const fn = jest.fn()
          const clusterConfig: ClusterConfig = {
            stdoutFile: 'my stdout file',
          }
          // When
          cluster.clusterize(fn, clusterConfig)
          // Then
          expect(mkdirp.sync).toHaveBeenCalledWith('my stdout file')
          expect(openSync).toHaveBeenCalledWith('my stdout file', 'a')
          expect(nodeCluster.setupMaster).toHaveBeenCalledWith({
            stdio: ['pipe', undefined, 'pipe', 'ipc'],
          })
        })
        test('should execute master with stderr log files', () => {
          // Given
          nodeCluster.isMaster = true
          const fn = jest.fn()
          const clusterConfig: ClusterConfig = {
            stderrFile: 'my stderr file',
          }
          // When
          cluster.clusterize(fn, clusterConfig)
          // Then
          expect(mkdirp.sync).toHaveBeenCalledWith('my stderr file')
          expect(openSync).toHaveBeenCalledWith('my stderr file', 'a')
          expect(nodeCluster.setupMaster).toHaveBeenCalledWith({
            stdio: ['pipe', 'pipe', undefined, 'ipc'],
          })
        })
        test('should execute worker function', () => {
          // Given
          nodeCluster.isMaster = false
          const fn = jest.fn().mockReturnValue(Promise.resolve())
          const clusterConfig: ClusterConfig = {}
          // When
          cluster.clusterize(fn, clusterConfig)
          // Then
          expect(fn).toHaveBeenCalledWith()
          expect(nodeCluster.setupMaster).not.toHaveBeenCalled()
        })
      })
      describe('launchWorker', () => {
        test('should launch a new worker and handle shutdown message', () => {
          // Given
          nodeCluster.workers = {
            a: 'a',
            b: 'b',
          }
          const workersCount = 2
          // When
          cluster.launchWorker(workersCount)
          // Then
          expect(nodeCluster.fork).toHaveBeenCalledWith({ CLUSTER_WORKERS: 2 })
        })
      })
      describe('reload', () => {
        let launchWorkerSpy: jest.SpyInstance
        let shutdownWorkerSpy: jest.SpyInstance
        beforeAll(() => {
          launchWorkerSpy = jest.spyOn(cluster, 'launchWorker').mockImplementation()
          shutdownWorkerSpy = jest.spyOn(cluster, 'shutdownWorker').mockImplementation(() => true)
          jest.useFakeTimers()
        })
        afterAll(() => {
          jest.clearAllTimers()
        })
        afterAll(() => {
          jest.useRealTimers()
          launchWorkerSpy.mockRestore()
          shutdownWorkerSpy.mockRestore()
        })
        test('should reload workers', () => {
          // Given
          nodeCluster.workers = {
            a: { id: 1 },
            b: { id: 2 },
          }
          // When
          cluster.reload()
          // Then
          expect(launchWorkerSpy).toHaveBeenCalledTimes(2)
          expect(launchWorkerSpy).toHaveBeenCalledWith(2)
          expect(setTimeout).toHaveBeenCalledTimes(2)
          expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 3000)
          expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 6000)
          jest.runAllTimers()
          expect(shutdownWorkerSpy).toHaveBeenCalledTimes(2)
          expect(shutdownWorkerSpy).toHaveBeenCalledWith(1)
          expect(shutdownWorkerSpy).toHaveBeenCalledWith(2)
        })
        test('should ignore falsy worker', () => {
          // Given
          nodeCluster.workers = {
            c: undefined,
          }
          // When
          cluster.reload()
          // Then
          expect(launchWorkerSpy).not.toHaveBeenCalled()
          expect(setTimeout).not.toHaveBeenCalled()
          expect(shutdownWorkerSpy).not.toHaveBeenCalled()
        })
      })
      describe('shutdown', () => {
        let shutdownWorkerSpy: jest.SpyInstance
        beforeAll(() => {
          shutdownWorkerSpy = jest.spyOn(cluster, 'shutdownWorker').mockImplementation()
          jest.useFakeTimers()
        })
        afterEach(() => {
          jest.clearAllTimers()
        })
        afterAll(() => {
          jest.useRealTimers()
          shutdownWorkerSpy.mockRestore()
        })
        test('should shutdown all workers', () => {
          // Given
          nodeCluster.workers = {
            1: { id: 1 },
            2: { id: 2 },
          }
          // When
          cluster.shutdown()
          // Then
          expect(setTimeout).toHaveBeenCalledTimes(2)
          expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 3000)
          expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 6000)
          jest.runAllTimers()
          expect(shutdownWorkerSpy).toHaveBeenCalledTimes(2)
          expect(shutdownWorkerSpy).toHaveBeenCalledWith(1)
          expect(shutdownWorkerSpy).toHaveBeenCalledWith(2)
        })
        test('should ignore falsy worker', () => {
          // Given
          nodeCluster.workers = {
            1: { id: 1 },
            undefined,
          }
          // When
          cluster.shutdown()
          // Then
          expect(setTimeout).toHaveBeenCalledTimes(1)
          expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 3000)
          jest.runAllTimers()
          expect(shutdownWorkerSpy).toHaveBeenCalledTimes(1)
          expect(shutdownWorkerSpy).toHaveBeenCalledWith(1)
        })
      })
      describe('shutdownWorker', () => {
        test('should shutdown worker given worker id', () => {
          // Given
          nodeCluster.workers = { 1: worker }
          const workerId = 1
          // When
          const result = cluster.shutdownWorker(workerId)
          // Then
          expect(result).toBe(true)
          expect(worker.send).toHaveBeenCalledWith('shutdown')
        })
        test('should ignore and return false given bad worker id', () => {
          // Given
          nodeCluster.workers = { 1: worker }
          const workerId = 2
          // When
          const result = cluster.shutdownWorker(workerId)
          // Then
          expect(result).toBe(false)
          expect(worker.send).not.toHaveBeenCalled()
        })
      })
    })
  })
})
