import { ErrorCode, ErrorStatusCode } from '../../../main/errors/http-error-codes'
import { StaticUnauthorizedErrorable } from '../../../main/types/errors'

describe('unauthorized error unit tests', () => {
  let HttpError: jest.Mocked<Error>
  let UnauthorizedError: jest.Mocked<StaticUnauthorizedErrorable>
  beforeAll(() => {
    jest.doMock('../../../main/errors/http-error')
    ;({ HttpError } = require('../../../main/errors/http-error'))
    ;({ UnauthorizedError } = require('../../../main/errors/unauthorized-error'))
  })
  test('should return a UnauthorizedError instance', () => {
    // Given
    const message = 'oops'
    const orig = new Error('oops')
    // When
    const error = new UnauthorizedError(message, orig)
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.UNAUTHORIZED,
      ErrorStatusCode.UNAUTHORIZED,
      message,
      orig,
    )
  })
  test('should return a UnauthorizedError instance without message', () => {
    // Given
    const orig = new Error('oops')
    // When
    const error = new UnauthorizedError(undefined, orig)
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.UNAUTHORIZED,
      ErrorStatusCode.UNAUTHORIZED,
      'This action requires an authorization',
      orig,
    )
  })
})
