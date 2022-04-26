import { ErrorCode, ErrorStatusCode } from '../../../main/errors/http-error-codes'
import { StaticTooManyRequestsErrorable } from '../../../main/types/errors'

describe('too many requests error unit tests', () => {
  let HttpError: jest.Mocked<Error>
  let TooManyRequestsError: jest.Mocked<StaticTooManyRequestsErrorable>
  beforeAll(() => {
    jest.doMock('../../../main/errors/http-error')
    ;({ HttpError } = require('../../../main/errors/http-error'))
    ;({ TooManyRequestsError } = require('../../../main/errors/too-many-requests-error'))
  })
  test('should return a TooManyRequestsError instance', () => {
    // Given
    const quotaCount = 3
    const quotaTime = 60
    // When
    const error = new TooManyRequestsError(quotaCount, quotaTime)
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.TOO_MANY_REQUESTS,
      ErrorStatusCode.TOO_MANY_REQUESTS,
      'max quota reached (3 calls per 60s)',
      undefined,
      undefined,
    )
  })
  test('should return a TooManyRequestsError instance given message and orig', () => {
    // Given
    const quotaCount = 3
    const quotaTime = 60
    const extra = { foo: 'bar' }
    // When
    const error = new TooManyRequestsError(quotaCount, quotaTime, extra)
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.TOO_MANY_REQUESTS,
      ErrorStatusCode.TOO_MANY_REQUESTS,
      'max quota reached (3 calls per 60s)',
      undefined,
      extra,
    )
  })
})
