import { ClusterConfig } from './cluster'

export interface LogConfig {
  name: string
}

export interface Config {
  cluster: ClusterConfig
  log: LogConfig
}
