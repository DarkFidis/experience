import { Logger } from 'winston'

import { getLogger } from './utils/logger'

const log: Logger = getLogger('express-template')

export { log }
