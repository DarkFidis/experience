import { log } from './log'
import { mongoClient } from './mongo'
import { webServer } from './server'
import { Workerable } from './types/worker'

const worker: Workerable = {
  handleSignal: async (name) => {
    log.info(`received ${name} signal : stopping`)
    await worker.shutdown()
  },
  run: async () => {
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']
    signals.forEach((signal) => {
      process.on(signal, () => {
        void worker.handleSignal(signal)
      })
    })
    process.on('message', (msg) => {
      log.info(`received message : ${msg}`)
      if (msg === 'shutdown') {
        log.info(`received shutdown message : stopping`)
        void worker.shutdown(0)
      }
    })
    webServer.init()
    await mongoClient.start()
    await webServer.start()
    log.info(`/!\\ to stop worker : kill -s SIGTERM ${process.pid}`)
  },
  shutdown: async (exitCode = 1) => {
    try {
      await webServer.stop()
      await mongoClient.stop()
      process.exit(exitCode)
    } catch (err) {
      log.error(err)
      process.exit(1)
    }
  },
}

export = worker
