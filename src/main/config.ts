import * as nodeConfig from 'config'

import { Config } from './types/config'

export const cluster = nodeConfig.has('cluster')
  ? nodeConfig.get<Config['cluster']>('cluster')
  : { workers: 0 }

export const log = nodeConfig.has('log')
  ? nodeConfig.get<Config['log']>('log')
  : { level: 'debug', name: 'Express-template' }

export const postgres = nodeConfig.has('postgres')
  ? nodeConfig.get<Config['postgres']>('postgres')
  : { dbName: 'express-template', host: 'localhost', logging: true }
