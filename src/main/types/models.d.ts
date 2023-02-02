import { DeepPartial, FindOptionsWhere, Repository, UpdateResult } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

import { ObjectLiteralWithId } from './pg'

export interface BaseModelable<Entity extends ObjectLiteralWithId> {
  readonly model: Repository<Entity>

  getAll(): Promise<Entity[]>
  getById(id: number): Promise<Entity | null>
  getOneByOptions(options: FindOptionsWhere<Entity>): Promise<Entity | null>
  create(input: DeepPartial<Entity>): Promise<Entity>
  update(input: QueryDeepPartialEntity<Entity>): Promise<UpdateResult>
  deleteById(id: number): Promise<Entity>
  clean(): Promise<void>
}
