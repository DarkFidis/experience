import { ErrorCode, ErrorStatusCode } from '../../../main/errors/http-error-codes'
import { StaticInternalErrorable } from '../../../main/types/errors'

describe('internal error unit tests', () => {
  let HttpError: jest.Mocked<Error>
  let InternalError: jest.Mocked<StaticInternalErrorable>
  beforeAll(() => {
    jest.doMock('../../../main/errors/http-error')
    ;({ HttpError } = require('../../../main/errors/http-error'))
    ;({ InternalError } = require('../../../main/errors/internal-error'))
  })
  test('should return a InternalError instance', () => {
    // When
    const error = new InternalError()
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.INTERNAL,
      ErrorStatusCode.INTERNAL,
      undefined,
      undefined,
    )
  })
  test('should return a InternalError instance given message and orig', () => {
    // Given
    const message = 'oops'
    const orig = new Error('oops')
    // When
    const error = new InternalError(message, orig)
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.INTERNAL,
      ErrorStatusCode.INTERNAL,
      message,
      orig,
    )
  })
})
