import * as nodeConfig from 'config'
import { Config } from "./types/config";

const cluster = nodeConfig.has('cluster') ? nodeConfig.get<Config['cluster']>('cluster') : { workers: 0 }

const log = nodeConfig.has('log') ? nodeConfig.get<Config['log']>('log') : { name: 'Express-template' }

const config: Config = {
  cluster,
  log
}

export = config
