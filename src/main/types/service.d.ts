export interface Initializable<T> {
  readonly config?: T

  init(opt?: Partial<T>): void
}

export interface Serviceable<T> extends Initializable<T> {
  readonly state: ServiceStateable

  end(): Promise<boolean>

  run(): Promise<boolean>

  start(): Promise<boolean>

  stop(): Promise<boolean>
}

export interface ServiceStateable {
  started: boolean
  stopping: boolean
}
