import { RequestHandler } from 'express'
import { IAppenderConfiguration, IBasicLayoutConfiguration, Logger as TsLogger } from 'ts-log-debug'

import { Mapable } from './basic-types'
import { Initializable } from './service'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LoggerConfig {
  appenders?: Mapable<IAppenderConfiguration>
  layout?: IBasicLayoutConfiguration
  level: LogLevel
}

export interface StaticLoggerable {
  defaultLoggerConfig: LoggerConfig
  new (name?: string): Loggerable
}
export interface Loggerable extends TsLogger, Initializable<LoggerConfig> {
  express(): RequestHandler
  log(...args: unknown[]): void
}
