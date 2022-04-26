describe('custom error unit tests', () => {
  let CustomError: jest.Mock
  beforeAll(() => {
    CustomError = require('../../../main/errors/custom-error').CustomError
  })
  test('should return a CustomError instance given message and orig params', () => {
    // Given
    const message = 'oops'
    const orig = new Error('oops')
    // When
    const error = new CustomError(message, orig)
    // Then
    expect(error).toBeTruthy()
    expect(error.orig).toBe(orig)
    expect(error.message).toEqual(message)
  })
  test('should return a CustomError instance given orig params', () => {
    // Given
    const orig = new Error('oops')
    // When
    const error = new CustomError(orig)
    // Then
    expect(error).toBeTruthy()
    expect(error.orig).toBe(orig)
    expect(error.message).toEqual(orig.message)
  })
})
