import { DeepPartial, Repository } from 'typeorm'

export interface BaseModelable<Entity> {
  readonly model: Repository<Entity>

  getAll(): Promise<Entity[]>
  getById(id: number): Promise<Entity>
  create(input: DeepPartial<Entity>): Promise<Entity>
  update(input: DeepPartial<Entity>): Promise<Entity>
  deleteById(id: number): Promise<void>
}
