import { ClusterConfig } from './cluster'

export interface LogConfig {
  level: string
  name: string
}

export interface Config {
  cluster: ClusterConfig
  log: LogConfig
}
