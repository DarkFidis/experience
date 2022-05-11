import 'reflect-metadata'

import { cluster } from './config'
import { log } from './log'
import { run as runMaster } from './master'
import { run as runWorker } from './worker'

if (cluster.workers !== 0) {
  runMaster()
} else {
  runWorker().catch((err) => {
    log.error(err)
    process.exit(1)
  })
}
