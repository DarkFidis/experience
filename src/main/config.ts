import * as nodeConfig from 'config'

import { Config } from './types/config'
import { MongoConfig } from './types/mongo'

export const cluster = nodeConfig.has('cluster')
  ? nodeConfig.get<Config['cluster']>('cluster')
  : { workers: 0 }

export const log = nodeConfig.has('log')
  ? nodeConfig.get<Config['log']>('log')
  : { level: 'debug', name: 'Express-template' }

const mongoConfiguration = nodeConfig.has('mongo')
  ? nodeConfig.get<Config['mongo']>('mongo')
  : { dbName: 'template' }

const { MONGO_HOST, MONGO_PASSWORD, MONGO_USER } = process.env
const { dbName } = mongoConfiguration
const mongoUrl =
  process.env.NODE_ENV === 'production'
    ? `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}/${dbName}`
    : `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:27017/${dbName}`
export const mongo: MongoConfig = {
  url: mongoUrl,
}
