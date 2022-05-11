import { log as logConfig } from './config'
import { Loggerable } from './types/logger'
import { Logger } from './utils/logger'

const log: Loggerable = new Logger(logConfig.name)

log.init()

export { log }
