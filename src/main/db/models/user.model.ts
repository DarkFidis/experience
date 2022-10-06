import { BaseModel } from './baseModel'

export class UserModel extends BaseModel {
  constructor(entity: any) {
    super(entity)
  }

  public async save(userInput: any) {
    if (!userInput.id) {
      return this.create(userInput)
    }
    return this.update(userInput)
  }
}
