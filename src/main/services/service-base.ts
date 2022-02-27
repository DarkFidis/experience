import { Loggerable } from '../types/logger'
import { Serviceable, ServiceStateable } from '../types/service'
import { InitBase } from './init-base'

abstract class ServiceBase<T> extends InitBase<T> implements Serviceable<T> {
  protected _state: ServiceStateable = {
    started: false,
    stopping: false,
  }

  protected constructor(name: string, log: Loggerable, defaultConfig?: T) {
    super(name, log, defaultConfig)
  }

  public get state(): ServiceStateable {
    return this._state
  }

  public abstract end(): Promise<boolean>

  public init(opt?: Partial<T>): void {
    super.init(opt)
    this.state.started = false
    this.state.stopping = false
  }

  public abstract run(): Promise<boolean>

  public async start(): Promise<boolean> {
    if (this.state.started) {
      this._log.info(`service ${this.name} already started : ignore`)
      return false
    }
    this.state.started = await this.run()
    if (this._state.started) {
      this._log.info(`service ${this.name} started`)
    } else {
      this._log.info(`service ${this.name} did not start`)
    }
    return this.state.started
  }

  public async stop(): Promise<boolean> {
    if (!this.state.started || this.state.stopping) {
      if (this.state.stopping) {
        this._log.warn(`service ${this.name} is already stopping : ignore`)
      } else {
        this._log.warn(`service ${this.name} is not started : ignore`)
      }
      return false
    }
    try {
      this.state.stopping = true
      const stopped = await this.end()
      if (stopped) {
        this._log.info(`service ${this.name} stopped`)
      } else {
        this._log.info(`service ${this.name} did not stop`)
      }
      this.state.started = !stopped
      return stopped
    } finally {
      this.state.stopping = false
    }
  }
}

export { ServiceBase }
