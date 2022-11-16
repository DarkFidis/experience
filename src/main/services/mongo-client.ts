import { connect, Mongoose } from 'mongoose'
import { Logger } from 'winston'

import { MongoClientable, MongoConfig, StaticMongoClientable } from '../types/mongo'
import { staticImplements } from '../utils/helper'
import { ServiceBase } from './service-base'

@staticImplements<StaticMongoClientable>()
export class MongoClient extends ServiceBase<MongoConfig> implements MongoClientable {
  protected _connection?: Mongoose

  constructor(log: Logger, config: MongoConfig) {
    super('mongo-client', log, config)
  }

  public async run() {
    try {
      this._connection = await connect(this.config.url)
      this._log.info('Connected')
    } catch (err) {
      this._log.error(err)
      return false
    }
    return true
  }

  public async end() {
    if (!this._connection) {
      this._log.warning('No connection found')
      return false
    }
    try {
      await this._connection.disconnect()
    } catch (err) {
      this._log.error(err)
      return false
    }
    return true
  }
}
