import { Logger } from 'winston'

import { Initializable } from '../types/service'

abstract class InitBase<T> implements Initializable<T> {
  protected _defaultConfig: T
  protected _config: T
  protected readonly _name: string
  protected readonly _log: Logger

  protected constructor(name: string, log: Logger, defaultConfig?: T) {
    this._name = name
    this._log = log
    this._defaultConfig = defaultConfig as T
    this._config = { ...defaultConfig } as T
  }

  public get name(): string {
    return this._name
  }

  public get config(): T {
    return this._config
  }

  public get defaultConfig(): T {
    return this._defaultConfig
  }

  public init(opt?: Partial<T>): void {
    this._log.debug(`initializing ${this.name}`)
    this._config = {
      ...this.defaultConfig,
      ...opt,
    }
    this._log.debug(`${this.name} initialized`)
  }
}

export { InitBase }
