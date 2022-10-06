import { when } from 'jest-when'
import { Logger } from 'winston'

import { PgClientable } from '../../main/types/pg'
import { WebServerable } from '../../main/types/web-server'
import { Workerable } from '../../main/types/worker'

describe('worker unit tests', () => {
  let mockProcess: { exit: jest.SpyInstance; on: jest.SpyInstance }
  let log: jest.Mocked<Logger>
  let webServer: jest.Mocked<WebServerable>
  let pgClient: jest.Mocked<PgClientable>
  beforeEach(() => {
    mockProcess = {
      exit: jest.spyOn(process, 'exit'),
      on: jest.spyOn(process, 'on'),
    }
    mockProcess.exit.mockImplementation()
    mockProcess.on.mockImplementation((__, handle) => {
      handle()
    })
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  afterAll(() => {
    jest.restoreAllMocks()
  })
  describe('system monitor enabled', () => {
    let worker: Workerable
    beforeAll(() => {
      jest.resetModules()
      jest.doMock('../../main/log')
      ;({ log } = require('../../main/log'))
      jest.doMock('../../main/services/web-server')
      jest.doMock('../../main/server')
      ;({ webServer } = require('../../main/server'))
      jest.doMock('../../main/postgres')
      ;({ pgClient } = require('../../main/postgres'))
      worker = require('../../main/worker')
    })
    describe('handleSignal', () => {
      let shutdownMock: jest.SpyInstance
      beforeAll(() => {
        shutdownMock = jest.spyOn(worker, 'shutdown').mockImplementation(() => Promise.resolve())
      })
      afterAll(() => {
        shutdownMock.mockRestore()
      })
      test('should stop and exit with code 1', async () => {
        // Given
        const name = 'name'
        // When
        await worker.handleSignal(name)
        // Then
        expect(shutdownMock).toHaveBeenCalledWith()
      })
    })
    describe('run', () => {
      let handleSignalSpy: jest.SpyInstance
      let shutdownMock: jest.SpyInstance
      beforeAll(() => {
        handleSignalSpy = jest.spyOn(worker, 'handleSignal').mockImplementation()
        shutdownMock = jest.spyOn(worker, 'shutdown').mockImplementation(() => Promise.resolve())
      })
      afterAll(() => {
        shutdownMock.mockRestore()
        handleSignalSpy.mockRestore()
      })
      test('should start app server', async () => {
        // When
        await worker.run()
        // Then
        expect(handleSignalSpy).toHaveBeenCalledTimes(2)
        expect(handleSignalSpy).toHaveBeenCalledWith('SIGINT')
        expect(handleSignalSpy).toHaveBeenCalledWith('SIGTERM')
        expect(pgClient.start).toHaveBeenCalled()
        expect(webServer.start).toHaveBeenCalled()
      })
      test('should start app server given log level is debug', async () => {
        // Given
        when(log.isLevelEnabled).calledWith('debug').mockReturnValue(true)
        // When
        await worker.run()
        // Then
        expect(handleSignalSpy).toHaveBeenCalledTimes(2)
        expect(handleSignalSpy).toHaveBeenCalledWith('SIGINT')
        expect(handleSignalSpy).toHaveBeenCalledWith('SIGTERM')
        expect(pgClient.start).toHaveBeenCalled()
        expect(webServer.start).toHaveBeenCalled()
      })
      test('should shutdown given shutdown message is received', async () => {
        // Given
        when(mockProcess.on)
          .calledWith('message', expect.any(Function))
          .mockImplementation((__, listener) => {
            listener('shutdown')
            expect(shutdownMock).toHaveBeenNthCalledWith(1, 0)
          })
        // When
        await worker.run()
        // Then
        expect(mockProcess.on).toHaveBeenCalledTimes(3)
        expect(mockProcess.on).toHaveBeenCalledWith('message', expect.any(Function))
      })
    })
    describe('shutdown', () => {
      test('should shutdown and exit with code 0', async () => {
        // When
        await worker.shutdown(0)
        // Then
        expect(webServer.stop).toHaveBeenNthCalledWith(1)
        expect(mockProcess.exit).toHaveBeenNthCalledWith(1, 0)
      })
      test('should shutdown and exit with code 0 given post process pendings', async () => {
        // Given
        // When
        await worker.shutdown(0)
        // Then
        expect(webServer.stop).toHaveBeenCalled()
        expect(pgClient.stop).toHaveBeenCalled()
        expect(mockProcess.exit).toHaveBeenNthCalledWith(1, 0)
      })
      test('should shutdown and exit with code 1', async () => {
        // When
        await worker.shutdown()
        // Then
        expect(webServer.stop).toHaveBeenCalled()
        expect(pgClient.stop).toHaveBeenCalled()
        expect(mockProcess.exit).toHaveBeenNthCalledWith(1, 1)
      })
      test('should shutdown and exit with code 1 given web server stop failed', async () => {
        // Given
        const error = new Error('oops')
        webServer.stop.mockRejectedValue(error)
        // When
        await worker.shutdown(0)
        // Then
        expect(webServer.stop).toHaveBeenCalled()
        expect(pgClient.stop).not.toHaveBeenCalled()
        expect(mockProcess.exit).toHaveBeenNthCalledWith(1, 1)
      })
    })
  })
})
