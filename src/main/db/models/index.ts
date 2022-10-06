import { pgClient } from '../../postgres'
import { User } from '../entities/User'
import { UserModel } from './user.model'

const userRepository = pgClient.getRepositoryFromEntity(User)

export const userModel = new UserModel(userRepository)
