import { log } from './log'
import { Cluster } from './utils/cluster'
import { run as runWorker } from './worker'
import { cluster as clusterConfig } from './config'

const run = (): void => {
  const cluster = new Cluster(log)
  cluster.clusterize(runWorker, clusterConfig)
  process.on('SIGUSR2', () => {
    log.warn('received SIGUSR2 signal : reloading workers')
    cluster.reload()
  })
}

export { run }
