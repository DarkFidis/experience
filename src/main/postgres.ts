import { DataSourceOptions } from 'typeorm'

import { postgres } from './config'
import { Customer } from './db/entities/User'
import { log } from './log'
import { PgClient } from './services/pg-client'

const dbConfig: DataSourceOptions = {
  database: postgres.dbName,
  entities: [Customer],
  host: postgres.host,
  logging: postgres.logging,
  password: process.env.DB_PASSWORD,
  port: 5432,
  synchronize: true,
  type: 'postgres',
  username: process.env.DB_USER,
}

export const pgClient = new PgClient(log, dbConfig)
