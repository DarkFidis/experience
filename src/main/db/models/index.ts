import { pgClient } from '../../postgres'
import { Customer } from '../entities/User'
import { UserModel } from './user.model'

const userRepository = pgClient.getRepositoryFromEntity(Customer)

export const userModel = new UserModel(userRepository)
