import { model } from 'mongoose'

import { UserModel } from '../types/models'
import { User } from '../types/user'
import { userSchema } from './user.schema'

export const userModel = model<User, UserModel>('User', userSchema)
