import { Schema } from 'mongoose'

import { UserModel } from '../types/models'
import { User as Userable } from '../types/user'
import { emailValidator, passwordValidator } from './validators'

export const userSchema = new Schema<Userable, UserModel>({
  email: {
    type: String,
    validate: {
      message: 'Invalid email',
      validator: emailValidator,
    },
  },
  firstName: String,
  lastName: String,
  password: {
    type: String,
    validate: {
      message: 'Invalid password',
      validator: passwordValidator,
    },
  },
})
