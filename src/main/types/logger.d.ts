import { FormatWrap } from 'logform'
import { Logger } from 'winston'

export interface LoggerConfig {
  level: string
}

export interface LogFormater {
  addCustomKeys(appName: string): FormatWrap
  keyToUpperCase(key: string): FormatWrap
  removeKeys(keys: string[]): FormatWrap
}

export type GetLogger = (appName: string) => Logger

export interface MockedWinston {
  config: {
    syslog: {
      levels: {
        info: number
      }
    }
  }
  createLogger: jest.Mock
  format: {
    colorize: jest.Mock
    combine: jest.Mock
    json: jest.Mock
    label: jest.Mock
    printf: jest.Mock
    splat: jest.Mock
    timestamp: jest.Mock
  }
  transports: {
    Console: jest.Mock
  }
}
