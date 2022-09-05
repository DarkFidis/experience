import { ClusterConfig } from './cluster'

export interface LogConfig {
  name: string
  level: string
}

export interface Config {
  cluster: ClusterConfig
  log: LogConfig
}
