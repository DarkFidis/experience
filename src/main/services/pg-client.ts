import { DataSource, DataSourceOptions, EntityTarget } from 'typeorm'
import { Logger } from 'winston'

import { PgClientable, StaticPgClientable } from '../types/pg'
import { staticImplements } from '../utils/helper'
import { ServiceBase } from './service-base'

@staticImplements<StaticPgClientable>()
export class PgClient extends ServiceBase<DataSourceOptions> implements PgClientable {
  protected _connection: DataSource

  constructor(log: Logger, config: DataSourceOptions) {
    super('pg-client', log, config)
    this._connection = new DataSource(this.config)
  }

  public get connection() {
    return this._connection
  }

  public async run() {
    try {
      await this._connection.initialize()
      this._log.info(`Connected to database ${this.config.database}`)
    } catch (err) {
      this._log.error(err)
      return false
    }
    return true
  }

  public async end() {
    try {
      await this._connection.destroy()
      this._log.info('Disconnected from database')
    } catch (err) {
      this._log.error(err)
      return false
    }
    return true
  }

  public getRepositoryFromEntity<T>(entity: EntityTarget<T>) {
    return this._connection.getRepository(entity)
  }

  public async clean() {
    const entities = this.connection.entityMetadatas
    const promises = entities.map(async (entity) => {
      const repository = this.getRepositoryFromEntity(entity.name)
      await repository.clear()
    })
    await Promise.all(promises)
  }
}
