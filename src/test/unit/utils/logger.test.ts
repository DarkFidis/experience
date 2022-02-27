import { Request, Response } from 'express'
import { resolve } from 'path'

import { Caller } from '../../../main/types/caller'
import { Loggerable, LoggerConfig, LogLevel, StaticLoggerable } from '../../../main/types/logger'

const baseDir = resolve(__dirname, '..', '..', '..', '..')

describe('logger unit tests', () => {
  let cluster: { worker: { id: string } }
  let TsLogger
  let getCaller: jest.Mock
  let onFinished: jest.Mock
  beforeEach(() => {
    jest.doMock('cluster')
    cluster = require('cluster')
    jest.doMock('express')
    jest.doMock('on-finished')
    onFinished = require('on-finished')
    jest.doMock('ts-log-debug')
    ;({ Logger: TsLogger } = require('ts-log-debug'))
    jest.doMock('../../../main/utils/caller')
    ;({ getCaller } = require('../../../main/utils/caller'))
  })
  afterEach(() => {
    jest.resetModules()
  })
  describe('workerIdLogTag', () => {
    test('should return worker id log pattern', () => {
      // Given
      cluster.worker = { id: 'myid' }
      // When
      const { workerIdLogTag } = require('../../../main/utils/logger')
      // Then
      expect(workerIdLogTag).toEqual(`worker#${cluster.worker.id}`)
    })
  })
  describe('tokens', () => {
    test('should return tokens', () => {
      // Given
      cluster.worker = { id: 'myid' }
      // When
      const { tokens } = require('../../../main/utils/logger')
      // Then
      expect(tokens).toBeInstanceOf(Object)
      expect(Object.keys(tokens)).toEqual(['workerId'])
      expect(tokens.workerId).toBeInstanceOf(Function)
      expect(tokens.workerId()).toEqual(`worker#${cluster.worker.id}`)
    })
  })
  describe('Logger', () => {
    describe('defaultLoggerConfig', () => {
      let nodeEnvOrig
      let nodeConfigEnvOrig
      beforeAll(() => {
        nodeEnvOrig = process.env.NODE_ENV
        nodeConfigEnvOrig = process.env.NODE_CONFIG_ENV
      })
      beforeEach(() => {
        delete process.env.NODE_ENV
        delete process.env.NODE_CONFIG_ENV
      })
      afterAll(() => {
        process.env.NODE_CONFIG_ENV = nodeConfigEnvOrig
        process.env.NODE_ENV = nodeEnvOrig
      })
      test('should provide default logger config given no NODE_ENV neither NODE_CONFIG_ENV', () => {
        // When
        const { Logger } = require('../../../main/utils/logger')
        // Then
        expect(Logger).toHaveProperty('defaultLoggerConfig')
        expect(Logger.defaultLoggerConfig).toHaveProperty('appenders')
      })
      test('should provide test logger config given NODE_ENV = "test"', () => {
        // Given
        process.env.NODE_ENV = 'test'
        // When
        const { Logger } = require('../../../main/utils/logger')
        // Then
        expect(Logger).toHaveProperty('defaultLoggerConfig')
        expect(Logger.defaultLoggerConfig).toEqual({
          appenders: { 'console-log': { type: 'console' } },
          layout: undefined,
          level: 'warn',
        })
      })
      test('should provide test logger config given NODE_ENV = "development"', () => {
        // Given
        process.env.NODE_ENV = 'development'
        // When
        const { Logger } = require('../../../main/utils/logger')
        // Then
        expect(Logger).toHaveProperty('defaultLoggerConfig')
        expect(Logger.defaultLoggerConfig).toEqual({
          appenders: { 'console-log': { type: 'console' } },
          layout: undefined,
          level: 'info',
        })
      })
    })
    describe('constructor', () => {
      let Logger: StaticLoggerable
      beforeEach(() => {
        Logger = require('../../../main/utils/logger').Logger
      })
      test('should return a default instance', () => {
        // When
        const log = new Logger()
        // Then
        expect(log).toBeTruthy()
        expect(TsLogger).toHaveBeenCalled()
      })
      test('should return an instance given name and options', () => {
        // Given
        const name = 'name'
        // When
        const log = new Logger(name)
        // Then
        expect(log).toBeTruthy()
        expect(TsLogger).toHaveBeenCalledWith(name)
      })
      describe('instance', () => {
        let log: Loggerable
        beforeEach(() => {
          log = new Logger()
          ;(log as { appenders: unknown }).appenders = {
            clear: jest.fn(),
            set: jest.fn(),
          }
        })
        describe('config', () => {
          test('should be ok', () => {
            expect(log.config).toBeTruthy()
          })
        })
        describe('init', () => {
          test('should init logger given default config', () => {
            // Given
            const opt: Partial<LoggerConfig> = { level: 'warn' }
            // When
            const result = log.init(opt)
            // Then
            expect(result).toBe(log)
            expect(log.level).toEqual('warn')
            expect(log.appenders.clear).toHaveBeenCalled()
            expect(log.appenders.set).toHaveBeenCalledTimes(1)
            expect(log.appenders.set).toHaveBeenCalledWith('console-log', { type: 'console' })
          })
          test('should init logger given default config with empty log level', () => {
            // Given
            const opt = ({ level: '' } as unknown) as Partial<LoggerConfig>
            // When
            const result = log.init(opt)
            // Then
            expect(result).toBe(log)
            expect(log.level).toEqual('warn')
            expect(log.appenders.clear).toHaveBeenCalled()
            expect(log.appenders.set).toHaveBeenCalledTimes(1)
            expect(log.appenders.set).toHaveBeenCalledWith('console-log', { type: 'console' })
          })
          test('should init logger given config without appenders', () => {
            // Given
            const opt: Partial<LoggerConfig> = { appenders: undefined }
            // When
            const result = log.init(opt)
            // Then
            expect(result).toBe(log)
            expect(log.level).toEqual('warn')
            expect(log.appenders.clear).not.toHaveBeenCalled()
            expect(log.appenders.set).not.toHaveBeenCalled()
          })
          test('should throw an error given bad log level', () => {
            // Given
            const opt: Partial<LoggerConfig> = { level: 'badlevel' as LogLevel }
            // When
            const fn = (): void => log.init(opt)
            const expectedError = new Error('Unsupported log level : badlevel')
            // Then
            expect(fn).toThrow(expectedError)
            expect(log.appenders.clear).not.toHaveBeenCalled()
            expect(log.appenders.set).not.toHaveBeenCalled()
          })
        })
        describe('log', () => {
          let spyInfo: jest.SpyInstance
          beforeEach(() => {
            spyInfo = jest.spyOn(Logger.prototype, 'info').mockImplementation()
          })
          afterEach(() => {
            spyInfo.mockRestore()
          })
          test('should call info method', () => {
            // Given
            const args = ['foo', 'bar']
            // When
            log.log(...args)
            // Then
            expect(spyInfo).toHaveBeenCalledWith(...args)
          })
        })
        describe('express', () => {
          test('should handle on finished given x-forwarded-for request header', () => {
            // Given
            const req = {
              headers: { 'x-forwarded-for': 'forwarded for' },
              ip: '192.168.1.99',
              method: 'get',
              originalUrl: 'original url',
            }
            const res = {
              get: jest.fn(),
              statusCode: 200,
            }
            const next = jest.fn()
            onFinished.mockImplementation((response, cb) => {
              expect(response).toBe(res)
              cb(undefined, res)
            })
            // When
            const result = log.express()
            // Then
            expect(result).toBeTruthy()
            result((req as unknown) as Request, (res as unknown) as Response, next)
            expect(next).toHaveBeenCalled()
            expect(onFinished).toHaveBeenCalledWith(res, expect.anything())
            expect(res.get).toHaveBeenCalledWith('content-length')
            expect(log.info).toHaveBeenCalledWith(
              'http - 192.168.1.99 - get - original url - 200 - ?',
            )
          })
          test('should handle error on finished', () => {
            // Given
            const req = {}
            const res = {
              get: jest.fn(),
            }
            const next = jest.fn()
            const error = new Error('oops')
            onFinished.mockImplementation((response, cb) => {
              expect(response).toBe(res)
              cb(error, res)
            })
            // When
            const result = log.express()
            // Then
            expect(result).toBeTruthy()
            result((req as unknown) as Request, (res as unknown) as Response, next)
            expect(next).toHaveBeenCalled()
            expect(onFinished).toHaveBeenCalledWith(res, expect.anything())
            expect(res.get).not.toHaveBeenCalled()
            expect(log.info).not.toHaveBeenCalled()
          })
          test('should handle on finished given ip', () => {
            // Given
            const req = {
              ip: '192.168.1.99',
              method: 'get',
              originalUrl: 'original url',
            }
            const res = {
              get: jest.fn(),
              statusCode: 200,
            }
            const next = jest.fn()
            onFinished.mockImplementation((response, cb) => {
              expect(response).toBe(res)
              cb(undefined, res)
            })
            // When
            const result = log.express()
            // Then
            expect(result).toBeTruthy()
            result((req as unknown) as Request, (res as unknown) as Response, next)
            expect(next).toHaveBeenCalled()
            expect(onFinished).toHaveBeenCalledWith(res, expect.anything())
            expect(res.get).toHaveBeenCalledWith('content-length')
            expect(log.info).toHaveBeenCalledWith(
              'http - 192.168.1.99 - get - original url - 200 - ?',
            )
          })
          test('should handle on finished given no status code', () => {
            // Given
            const req = {
              ip: '192.168.1.99',
              method: 'get',
              originalUrl: 'original url',
            }
            const res = {
              get: jest.fn(),
            }
            const next = jest.fn()
            onFinished.mockImplementation((response, cb) => {
              expect(response).toBe(res)
              cb(undefined, res)
            })
            // When
            const result = log.express()
            // Then
            expect(result).toBeTruthy()
            result((req as unknown) as Request, (res as unknown) as Response, next)
            expect(next).toHaveBeenCalled()
            expect(onFinished).toHaveBeenCalledWith(res, expect.anything())
            expect(res.get).toHaveBeenCalledWith('content-length')
            expect(log.info).toHaveBeenCalledWith(
              'http - 192.168.1.99 - get - original url - ? - ?',
            )
          })
          test('should handle on finished given response content length', () => {
            // Given
            const req = {
              ip: '192.168.1.99',
              method: 'get',
              originalUrl: 'original url',
            }
            const res = {
              get: jest.fn(),
              statusCode: 200,
            }
            const contentLength = 123
            res.get.mockImplementation(() => contentLength)
            const next = jest.fn()
            onFinished.mockImplementation((response, cb) => {
              expect(response).toBe(res)
              cb(undefined, res)
            })
            // When
            const result = log.express()
            // Then
            expect(result).toBeTruthy()
            result((req as unknown) as Request, (res as unknown) as Response, next)
            expect(next).toHaveBeenCalled()
            expect(onFinished).toHaveBeenCalledWith(res, expect.anything())
            expect(res.get).toHaveBeenCalledWith('content-length')
            expect(log.info).toHaveBeenCalledWith(
              'http - 192.168.1.99 - get - original url - 200 - 123',
            )
          })
        })
        describe('trace', () => {
          let spyIsLevelEnabled
          beforeEach(() => {
            spyIsLevelEnabled = jest.spyOn(log, 'isLevelEnabled').mockImplementation(() => false)
          })
          afterEach(() => {
            spyIsLevelEnabled.mockRestore()
          })
          test('should log trace with caller infos', () => {
            // Given
            const data = 'message'
            const caller: Caller = {
              file: 'sourcefile',
              line: 4,
            }
            spyIsLevelEnabled.mockImplementation(() => true)
            getCaller.mockReturnValue(caller)
            TsLogger.prototype.write.mockReturnValue(log)
            // When
            const result = log.trace(data)
            // Then
            expect(result).toBe(log)
            expect(spyIsLevelEnabled).toHaveBeenCalledWith('trace')
            expect(getCaller).toHaveBeenCalledWith(baseDir)
            expect(TsLogger.prototype.write).toHaveBeenCalledWith('trace', 'sourcefile:4 - message')
          })
          test('should not log given trace level is disable', () => {
            // Given
            spyIsLevelEnabled.mockImplementation(() => false)
            const data = 'message'
            // When
            const result = log.trace(data)
            // Then
            expect(result).toBe(log)
            expect(spyIsLevelEnabled).toHaveBeenCalledWith('trace')
            expect(getCaller).not.toHaveBeenCalled()
            expect(TsLogger.prototype.write).not.toHaveBeenCalled()
          })
        })
      })
    })
  })
})
