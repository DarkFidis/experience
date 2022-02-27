import { ClusterSettings } from 'cluster'

import { Loggerable } from './logger'

export interface ClusterConfig {
  settings?: ClusterSettings
  stdoutFile?: string
  stderrFile?: string
  workers?: number
}

export type StaticClusterable = new (log: Loggerable) => Clusterable

export interface Clusterable {
  clusterize(fn: () => Promise<void>, clusterConfig: ClusterConfig): void

  launchWorker(workersCount: number): void

  reload(): void

  shutdownWorker(workerId: number): boolean

  shutdown(): void
}
