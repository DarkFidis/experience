import { DataSourceOptions, EntityTarget, Repository } from 'typeorm'
import { Logger } from 'winston'

import { Serviceable } from './service'

export interface StaticPgClientable {
  new (log: Logger, config: DataSourceOptions): PgClientable
}

export interface PgClientable extends Serviceable<DataSourceOptions> {
  readonly connection: any
  run(): Promise<boolean>
  end(): Promise<boolean>
  getRepositoryFromEntity<T>(entity: EntityTarget<T>): Repository<T>
  clean(): Promise<void>
}

export interface PgConfig {
  url: string
}
