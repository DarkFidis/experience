describe('validators', () => {
  let emailValidator
  let passwordValidator
  beforeAll(() => {
    ;({ emailValidator, passwordValidator } = require('../../../main/models/validators'))
  })
  describe('emailValidator', () => {
    it('should validate email', () => {
      // Given
      const email = 'johndoe@gmail.com'
      // When
      const result = emailValidator(email)
      // Then
      expect(result).toBe(true)
    })
  })
  describe('passwordValidator', () => {
    it('should validate password', () => {
      // Given
      const password = 'MyPassword123@'
      // When
      const result = passwordValidator(password)
      // Then
      expect(result).toBe(true)
    })
  })
})
