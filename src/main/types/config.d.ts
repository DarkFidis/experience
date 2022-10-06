import { ClusterConfig } from './cluster'

export interface LogConfig {
  level: string
  name: string
}

export interface DbConfig {
  dbName: string
  host: string
  logging: boolean
}

export interface Config {
  cluster: ClusterConfig
  log: LogConfig
  postgres: DbConfig
}
