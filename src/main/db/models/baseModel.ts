import { NotFoundError } from '../../errors/not-found-error'
import { BaseModelable } from '../../types/models'

abstract class BaseModel implements BaseModelable {
  protected _model: any
  protected constructor(entity: any) {
    this._model = entity
  }

  public get model() {
    return this._model
  }

  public async getAll() {
    return this.model.find()
  }

  public async getById(id: number) {
    return this.model.findOneBy({ id })
  }

  public async getOneByOptions(options: any) {
    return this.model.findOneBy(options)
  }

  public async create(input: any) {
    const entity = this.model.create(input)
    return this.model.save(entity)
  }

  public async update(input: any) {
    const entityToUpdate = await this.getById(input.id)
    if (!entityToUpdate) {
      throw new NotFoundError('Entity not found')
    }
    await this.model.update(entityToUpdate.id, input)
    return input
  }

  public async deleteById(id: number) {
    const entity = await this.getById(id)
    if (!entity) {
      throw new NotFoundError('Entity not found')
    }
    return this.model.remove(entity)
  }
}

export { BaseModel }
