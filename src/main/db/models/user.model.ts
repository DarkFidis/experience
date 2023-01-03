import { Repository } from 'typeorm'

import { User } from '../entities/User'
import { BaseModel } from './baseModel'

export class UserModel extends BaseModel<User> {
  constructor(entity: Repository<User>) {
    super(entity)
  }

  public async save(userInput: any) {
    if (!userInput.id) {
      return this.create(userInput)
    }
    return this.update(userInput)
  }

  public async getOneByEmail(email: string) {
    return this.getOneByOptions({ email })
  }
}
