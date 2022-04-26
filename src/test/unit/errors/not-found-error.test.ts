import { ErrorCode, ErrorStatusCode } from '../../../main/errors/http-error-codes'
import { StaticNotFoundErrorable } from '../../../main/types/errors'

describe('not found error unit tests', () => {
  let HttpError: jest.Mocked<Error>
  let NotFoundError: jest.Mocked<StaticNotFoundErrorable>
  beforeAll(() => {
    jest.doMock('../../../main/errors/http-error')
    ;({ HttpError } = require('../../../main/errors/http-error'))
    ;({ NotFoundError } = require('../../../main/errors/not-found-error'))
  })
  test('should return a NotFoundError instance', () => {
    // When
    const error = new NotFoundError()
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.NOT_FOUND,
      ErrorStatusCode.NOT_FOUND,
      NotFoundError.defaultMessage,
      undefined,
      undefined,
    )
  })
  test('should return a NotFoundError instance given message and orig', () => {
    // Given
    const message = 'oops'
    const orig = new Error('oops')
    const extra = { foo: 'bar' }
    // When
    const error = new NotFoundError(message, orig, extra)
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.NOT_FOUND,
      ErrorStatusCode.NOT_FOUND,
      message,
      orig,
      extra,
    )
  })
})
