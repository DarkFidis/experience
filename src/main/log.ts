import { Logger } from 'winston'

import { log as logConfig } from './config'
import { getLogger } from './utils/logger'

const log: Logger = getLogger(logConfig.name)

export { log }
