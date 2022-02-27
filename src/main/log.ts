import { Loggerable } from './types/logger'
import { Logger } from './utils/logger'
import { log as logConfig } from './config'

const log: Loggerable = new Logger(logConfig.name)

log.init()

export { log }
