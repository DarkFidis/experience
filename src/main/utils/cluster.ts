import {
  Address,
  ClusterSettings,
  fork,
  isMaster,
  on as clusterOn,
  setupMaster,
  Worker,
  workers,
} from 'cluster'
import { openSync } from 'fs'
import * as mkdirp from 'mkdirp'
import { cpus } from 'os'

import { Clusterable, ClusterConfig, StaticClusterable } from '../types/cluster'
import { Loggerable } from '../types/logger'
import { repeat, staticImplements } from './helper'

const defaultWorkers = cpus().length

@staticImplements<StaticClusterable>()
class Cluster implements Clusterable {
  protected _log: Loggerable

  constructor(log: Loggerable) {
    this._log = log
  }

  public clusterize(fn: () => Promise<void>, clusterConfig: ClusterConfig): void {
    const log = this._log
    if (!isMaster) {
      void fn().then(() => {
        log.debug('clusterized function ended')
      })
      return
    }
    const noWorkers = clusterConfig.workers !== undefined ? clusterConfig.workers : defaultWorkers
    const settings: ClusterSettings = { ...clusterConfig.settings }
    if (clusterConfig.stdoutFile || clusterConfig.stderrFile) {
      settings.stdio = ['pipe', 'pipe', 'pipe', 'ipc']
      const createFileStream = (filePath: string): number => {
        mkdirp.sync(filePath)
        return openSync(filePath, 'a')
      }
      if (clusterConfig.stdoutFile) {
        settings.stdio[1] = createFileStream(clusterConfig.stdoutFile)
      }
      if (clusterConfig.stderrFile) {
        settings.stdio[2] = createFileStream(clusterConfig.stderrFile)
      }
    }
    log.info(`going to launch ${noWorkers} workers.`)
    setupMaster(settings)
    clusterOn('fork', (worker: Worker) => {
      const id = worker.id
      const pid = worker.process.pid
      log.warn(`worker #${id} (pid:${pid}) forked`)
    })
    clusterOn('online', (worker: Worker) => {
      const id = worker.id
      const pid = worker.process.pid
      log.warn(`worker #${id} (pid:${pid}) is online`)
    })
    clusterOn('listening', (worker: Worker, address: Address) => {
      const id = worker.id
      const pid = worker.process.pid
      log.warn(`worker #${id} (pid:${pid}) is listening to port ${address.port}`)
    })
    clusterOn('exit', (worker: Worker, code: number) => {
      const workerId = worker.id
      const pid = worker.process.pid
      log.warn(`worker #${workerId} (pid:${pid}) died with code: ${code}`)
      if (code !== 0) {
        this.launchWorker(noWorkers)
      }
    })
    repeat(noWorkers, (index) => {
      setTimeout(() => {
        this.launchWorker(noWorkers)
      }, index * 3000)
    })
    log.warn(`/!\\ to reload workers : kill -s SIGUSR2 ${process.pid}`)
  }

  public launchWorker(workersCount: number): void {
    const log = this._log
    log.warn('launching a new worker...')
    fork({ CLUSTER_WORKERS: workersCount })
  }

  public reload(): void {
    const items = Object.values(workers)
    items.forEach((worker) => {
      if (!worker) {
        return
      }
      const timeout = worker.id * 3000
      this.launchWorker(items.length)
      setTimeout(() => {
        this.shutdownWorker(worker.id)
      }, timeout)
    })
  }

  public shutdown(): void {
    Object.values(workers).forEach((worker) => {
      if (!worker) {
        return
      }
      const timeout = worker.id * 3000
      setTimeout(() => {
        this.shutdownWorker(worker.id)
      }, timeout)
    })
  }

  public shutdownWorker(workerId: number): boolean {
    const log = this._log
    const worker: Worker | undefined = workers[workerId]
    if (!worker) {
      return false
    }
    const pid = worker.process.pid
    log.info(`shutdowning worker #${workerId} (pid:${pid})...`)
    worker.send('shutdown')
    return true
  }
}

export { Cluster }
