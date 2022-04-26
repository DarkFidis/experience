import { ErrorCode, ErrorStatusCode } from '../../../main/errors/http-error-codes'
import { StaticBadRequestErrorable } from '../../../main/types/errors'

describe('bad request error unit tests', () => {
  let HttpError: jest.Mocked<Error>
  let BadRequestError: jest.Mocked<StaticBadRequestErrorable>
  beforeAll(() => {
    jest.doMock('../../../main/errors/http-error')
    ;({ HttpError } = require('../../../main/errors/http-error'))
    ;({ BadRequestError } = require('../../../main/errors/bad-request-error'))
  })
  test('should return a BadRequestError instance', () => {
    // When
    const error = new BadRequestError()
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.BAD_REQUEST,
      ErrorStatusCode.BAD_REQUEST,
      undefined,
      undefined,
    )
  })
  test('should return a BadRequestError instance given message and orig', () => {
    // Given
    const message = 'oops'
    const orig = new Error('oops')
    // When
    const error = new BadRequestError(message, orig)
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.BAD_REQUEST,
      ErrorStatusCode.BAD_REQUEST,
      message,
      orig,
    )
  })
})
