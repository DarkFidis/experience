import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

import { NotFoundError } from '../../errors/not-found-error'
import { BaseModelable } from '../../types/models'
import { ObjectLiteralWithId } from '../../types/pg'

abstract class BaseModel<Entity extends ObjectLiteralWithId> implements BaseModelable<Entity> {
  protected _model: Repository<Entity>
  protected constructor(entity: Repository<Entity>) {
    this._model = entity
  }

  public get model() {
    return this._model
  }

  public async getAll() {
    return this.model.find()
  }

  public async getById(id) {
    return this.model.findOneBy({ id })
  }

  public async getOneByOptions(options: FindOptionsWhere<Entity>) {
    return this.model.findOneBy(options)
  }

  public async create(input: DeepPartial<Entity>) {
    const entity = this.model.create(input)
    return this.model.save(entity)
  }

  public async update(input: QueryDeepPartialEntity<Entity>) {
    // @ts-ignore
    const entityToUpdate = await this.getById(input.id)
    if (!entityToUpdate) {
      throw new NotFoundError('Entity not found')
    }
    return this.model.update(entityToUpdate.id, input)
  }

  public async deleteById(id: number) {
    const entity = await this.getById(id)
    if (!entity) {
      throw new NotFoundError('Entity not found')
    }
    return this.model.remove(entity)
  }

  public async clean() {
    if (process.env.NODE_CONFIG_ENV !== 'production') {
      return this.model.clear()
    }
    throw new Error('Clean does not work in production mode')
  }
}

export { BaseModel }
