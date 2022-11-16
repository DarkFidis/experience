import { ObjectId } from 'mongodb'
import { Logger } from 'winston'

import { Serviceable } from './service'

export interface StaticMongoClientable {
  new (log: Logger, config: MongoConfig): MongoClientable
}

export interface MongoClientable extends Serviceable<MongoConfig> {
  run(): Promise<boolean>
  end(): Promise<boolean>
}

export interface MongoConfig {
  url: string
}

export type Ref<T> = T | ObjectId
