import { DeepPartial, Repository } from 'typeorm'

import { Customer } from '../entities/User'
import { BaseModel } from './baseModel'

export class UserModel extends BaseModel<Customer> {
  constructor(entity: Repository<Customer>) {
    super(entity)
  }

  public async save(userInput: DeepPartial<Customer>) {
    if (!userInput.id) {
      return this.create(userInput)
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.update(userInput)
  }

  public async getOneByEmail(email: string) {
    return this.getOneByOptions({ email })
  }
}
