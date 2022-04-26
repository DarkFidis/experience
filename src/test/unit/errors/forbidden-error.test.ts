import { ErrorCode, ErrorStatusCode } from '../../../main/errors/http-error-codes'
import { StaticForbiddenErrorable } from '../../../main/types/errors'

describe('forbidden error unit tests', () => {
  let HttpError: jest.Mocked<Error>
  let ForbiddenError: jest.Mocked<StaticForbiddenErrorable>
  beforeAll(() => {
    jest.doMock('../../../main/errors/http-error')
    ;({ HttpError } = require('../../../main/errors/http-error'))
    ;({ ForbiddenError } = require('../../../main/errors/forbidden-error'))
  })
  test('should return a ForbiddenError instance', () => {
    // When
    const error = new ForbiddenError()
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.FORBIDDEN,
      ErrorStatusCode.FORBIDDEN,
      ForbiddenError.defaultMessage,
      undefined,
    )
  })
  test('should return a ForbiddenError instance given message and orig', () => {
    // Given
    const message = 'oops'
    const orig = new Error('oops')
    // When
    const error = new ForbiddenError(message, orig)
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.FORBIDDEN,
      ErrorStatusCode.FORBIDDEN,
      message,
      orig,
    )
  })
})
