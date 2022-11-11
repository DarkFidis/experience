import { LogFormater } from '../../../../main/types/logger'

describe('tranformers unit tests', () => {
  let winston: { format: unknown }
  let transformers: LogFormater
  beforeAll(() => {
    jest.doMock('winston', () => ({
      format: jest.fn().mockImplementation((arg) => arg),
    }))
    winston = require('winston')
    ;({ transformers } = require('../../../../main/utils/logger/transformers'))
  })
  describe('addCustomKeys', () => {
    test(' should add keys according to itaas specs', () => {
      const appName = 'appName'
      const logEvent = {
        level: 'info',
        message: 'test',
        timestamp: 123,
      }
      const eventWithCustomKeys = transformers.addCustomKeys(appName)(logEvent)
      expect(winston.format).toHaveBeenCalledWith(expect.any(Function))
      expect(eventWithCustomKeys).toEqual({
        ...logEvent,
        app_datetime: logEvent.timestamp,
        app_message: logEvent.message,
        app_name: appName,
        severity_level: logEvent.level,
      })
    })
  })
  describe('keyToUpperCase', () => {
    test('should put key to upperCase', () => {
      const logEvent = {
        level: 'info',
        message: 'test',
        timestamp: 123,
      }
      const eventWithCustomKeys = transformers.keyToUpperCase('level')(logEvent)
      expect(winston.format).toHaveBeenCalledWith(expect.any(Function))
      expect(eventWithCustomKeys).toEqual({
        level: 'INFO',
        message: 'test',
        timestamp: 123,
      })
    })
  })
  describe('removeKeys', () => {
    test('should keys from log event', () => {
      const logEvent = {
        level: 'info',
        message: 'test',
        timestamp: 123,
      }
      const eventWithCustomKeys = transformers.removeKeys(['level', 'message'])(logEvent)
      expect(winston.format).toHaveBeenCalledWith(expect.any(Function))
      expect(eventWithCustomKeys).toEqual({
        timestamp: 123,
      })
    })
  })
})
