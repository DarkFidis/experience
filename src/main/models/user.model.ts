import { model, Schema } from 'mongoose'

import { UserModel } from '../types/models'
import { User as Userable } from '../types/user'

const userSchema = new Schema<Userable, UserModel>({
  email: String,
  firstName: String,
  lastName: String,
  password: String,
})

export const User = model<Userable, UserModel>('User', userSchema)
