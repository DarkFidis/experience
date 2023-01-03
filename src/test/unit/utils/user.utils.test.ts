import { UserUtils } from '../../../main/types/utils'

describe('User utils unit tests', () => {
  let compare
  let hash
  let userUtils: UserUtils
  beforeAll(() => {
    jest.doMock('bcrypt')
    ;({ compare, hash } = require('bcrypt'))
    userUtils = require('../../../main/utils/user.utils')
  })
  describe('hashPassword', () => {
    it('should encrypt given valid password', async () => {
      // Given
      const password = 'Password123$'
      const encryptedPassword = 'myEncryptedPassword'
      hash.mockResolvedValue(encryptedPassword)
      // When
      const result = await userUtils.hashPassword(password)
      // Then
      expect(hash).toHaveBeenCalledWith(password, 10)
      expect(result).toBe(encryptedPassword)
    })
  })

  describe('verifyPassword', () => {
    it('should verify password', async () => {
      // Given
      const password = 'password'
      const passwordHash = 'passwordHash'
      compare.mockResolvedValue(true)
      // When
      const result = await userUtils.verifyPassword(password, passwordHash)
      // Then
      expect(compare).toHaveBeenCalledWith(password, passwordHash)
      expect(result).toBe(true)
    })
  })
})
