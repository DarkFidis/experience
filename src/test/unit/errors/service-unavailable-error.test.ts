import { ErrorCode, ErrorStatusCode } from '../../../main/errors/http-error-codes'
import { StaticServiceUnavailableErrorable } from '../../../main/types/errors'

describe('service unavailable error unit tests', () => {
  let HttpError: jest.Mocked<Error>
  let ServiceUnavailableError: jest.Mocked<StaticServiceUnavailableErrorable>
  beforeAll(() => {
    jest.doMock('../../../main/errors/http-error')
    ;({ HttpError } = require('../../../main/errors/http-error'))
    ;({ ServiceUnavailableError } = require('../../../main/errors/service-unavailable-error'))
  })
  test('should return a ServiceUnavailableError instance', () => {
    // When
    const error = new ServiceUnavailableError()
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.SERVICE_UNAVAILABLE,
      ErrorStatusCode.SERVICE_UNAVAILABLE,
      ServiceUnavailableError.defaultMessage,
      undefined,
      undefined,
    )
  })
  test('should return a ServiceUnavailableError instance given message and orig', () => {
    // Given
    const message = 'oops'
    const orig = new Error('oops')
    const extra = { foo: 'bar' }
    // When
    const error = new ServiceUnavailableError(message, orig, extra)
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.SERVICE_UNAVAILABLE,
      ErrorStatusCode.SERVICE_UNAVAILABLE,
      message,
      orig,
      extra,
    )
  })
})
