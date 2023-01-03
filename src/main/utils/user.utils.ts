import { compare, hash } from 'bcrypt'

import { UserUtils } from '../types/utils'

const userUtils: UserUtils = {
  hashPassword: async (password) => {
    const saltRounds = 10
    return await hash(password, saltRounds)
  },
  verifyPassword: async (password, passwordHash) => {
    return await compare(password, passwordHash)
  },
}

export = userUtils
