import { LogEntry, LoggerOptions } from 'winston'

import { LogConfig } from '../../../../main/types/config'
import { GetLogger, LogFormater, MockedWinston } from '../../../../main/types/logger'

describe('Logger unit tests', () => {
  const envVarNames: string[] = ['NODE_CONFIG_ENV', 'NODE_ENV', 'JSON_LOG']
  const envMapOrig: {
    [key: string]: string | undefined
  } = {}
  let getLogger: GetLogger
  let transformers: LogFormater
  let log: LogConfig
  let winston: jest.Mocked<MockedWinston>
  const logEntry: LogEntry = {
    label: 'test',
    level: 'info',
    message: 'bonjour à tout le monde, exemple de log',
    timestamp: 123,
  }
  let templateFunc: (arg: LogEntry) => string
  beforeAll(() => {
    envVarNames.forEach((name) => {
      envMapOrig[name] = process.env[name]
    })
  })
  beforeEach(() => {
    envVarNames.forEach((name) => {
      delete process.env[name]
    })
    log = {
      level: 'info',
    } as LogConfig
    jest.doMock('../../../../main/config', () => ({ log }))
    jest.doMock('winston', () => ({
      config: {
        syslog: {
          levels: {
            info: 3,
          },
        },
      },
      createLogger: jest.fn(),
      format: {
        colorize: jest.fn(),
        combine: jest.fn(),
        json: jest.fn(),
        label: jest.fn(),
        printf: jest.fn().mockImplementation((templateFn) => {
          templateFunc = templateFn
        }),
        splat: jest.fn(),
        timestamp: jest.fn(),
      },
      transports: {
        Console: jest.fn(),
      },
    }))
    winston = require('winston')
    jest.doMock('../../../../main/utils/logger/transformers', () => ({
      transformers: {
        addCustomKeys: jest.fn().mockReturnValue(jest.fn()),
        keyToUpperCase: jest.fn().mockReturnValue(jest.fn()),
        removeKeys: jest.fn().mockReturnValue(jest.fn()),
      },
    }))
    ;({ transformers } = require('../../../../main/utils/logger/transformers'))
  })
  afterEach(() => {
    jest.resetModules()
  })
  afterAll(() => {
    envVarNames.forEach((name) => {
      envMapOrig[name] = process.env[name]
    })
  })
  test.each([
    [undefined, undefined],
    ['development', 'development'],
    ['development', 'test'],
    ['development', 'staging'],
    ['development', 'preprod'],
    ['development', 'production'],
    ['development', undefined],
    ['production', 'development'],
    ['production', 'test'],
    ['production', 'production'],
    ['production', 'staging'],
    ['production', 'preprod'],
    ['production', undefined],
  ])(
    'should initiate correctly logger with NODE_ENV=%s and NODE_CONFIG_ENV=%s',
    (nodeEnv?: string, nodeConfigEnv?: string) => {
      // given
      if (nodeEnv) {
        process.env.NODE_ENV = nodeEnv
      }
      if (nodeConfigEnv) {
        process.env.NODE_CONFIG_ENV = nodeConfigEnv
      }
      const combineFunctionReturnValue = 'combineReturn'
      const consoleTransportReturnValue = { consoleReturn: true }
      const computedEnv = nodeConfigEnv || nodeEnv || 'development'
      const transportArg = { stderrLevels: ['error', 'fatal', 'warn'] }
      const appName = 'test'
      const loggerOptions = {
        format: combineFunctionReturnValue,
        level: 'info',
        levels: { info: 3 },
        transports: [consoleTransportReturnValue],
      } as unknown as LoggerOptions
      ;({ getLogger } = require('../../../../main/utils/logger'))
      winston.format.combine.mockReturnValue(combineFunctionReturnValue)
      winston.transports.Console.mockReturnValue(consoleTransportReturnValue)
      // when
      getLogger(appName)
      // then
      expect(winston.format.combine).toHaveBeenCalledTimes(3)
      expect(winston.format.timestamp).toHaveBeenCalledWith({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZZ' })
      expect(winston.format.splat).toHaveBeenCalled()
      expect(winston.format.label).toHaveBeenCalledWith({ label: 'test' })
      expect(winston.format.colorize).toHaveBeenCalledWith({ level: true })
      expect(winston.format.printf).toHaveBeenCalledWith(expect.any(Function))
      expect(winston.createLogger).toHaveBeenCalledWith(loggerOptions)
      if (computedEnv === 'production' || computedEnv === 'preprod') {
        expect(winston.transports.Console).toHaveBeenCalledWith(transportArg)
      } else {
        expect(winston.transports.Console).toBeCalled()
      }
      expect(transformers.keyToUpperCase).toHaveBeenCalledWith('level')
      expect(transformers.addCustomKeys).toHaveBeenCalledWith(appName)
      expect(transformers.removeKeys).toHaveBeenCalledWith(['timestamp', 'level', 'message'])
    },
  )
  test.each([undefined, 'true'])('should use correct format with JSON_LOG=%s', (jsonLog) => {
    if (jsonLog) {
      process.env.JSON_LOG = jsonLog
    }
    // given
    const appName = 'test'
    const combineFunctionReturnValues: string[] = [
      'baseFormatCombineReturn',
      'defaultFormatCombineReturn',
      'jsonFormatCombineReturn',
    ]
    const consoleTransportReturnValue = { consoleReturn: true }
    const loggerOptions = {
      format: jsonLog ? combineFunctionReturnValues[2] : combineFunctionReturnValues[1],
      level: 'info',
      levels: { info: 3 },
      transports: [consoleTransportReturnValue],
    } as unknown as LoggerOptions
    winston.transports.Console.mockReturnValue(consoleTransportReturnValue)
    winston.format.combine
      .mockReturnValueOnce(combineFunctionReturnValues[0])
      .mockReturnValueOnce(combineFunctionReturnValues[1])
      .mockReturnValueOnce(combineFunctionReturnValues[2])
    ;({ getLogger } = require('../../../../main/utils/logger'))
    // when
    getLogger(appName)
    // then
    expect(winston.createLogger).toHaveBeenCalledWith(loggerOptions)
    if (!jsonLog) {
      expect(templateFunc(logEntry)).toBe(
        `[${logEntry.timestamp}] [${logEntry.level}] [${logEntry.label}] - ${logEntry.message}`,
      )
    } else {
      expect(winston.format.json).toHaveBeenCalled()
    }
  })
})
