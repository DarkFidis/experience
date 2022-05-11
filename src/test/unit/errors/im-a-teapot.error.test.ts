import { ErrorCode, ErrorStatusCode } from '../../../main/errors/http-error-codes'
import { StaticTeapotErrorable } from '../../../main/types/errors'

describe('Im a teapot error unit tests', () => {
  let HttpError: jest.Mocked<Error>
  let TeapotError: jest.Mocked<StaticTeapotErrorable>
  beforeAll(() => {
    jest.doMock('../../../main/errors/http-error')
    ;({ HttpError } = require('../../../main/errors/http-error'))
    ;({ TeapotError } = require('../../../main/errors/im-a-teapot.error'))
  })
  test('should return a TeapotError instance', () => {
    // When
    const error = new TeapotError()
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.IM_A_TEAPOT,
      ErrorStatusCode.IM_A_TEAPOT,
      'What do you think I am ?',
      undefined,
    )
  })
  test('should return a TeapotError instance given message and orig', () => {
    // Given
    const message = 'oops'
    const orig = new Error('oops')
    // When
    const error = new TeapotError(message, orig)
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.IM_A_TEAPOT,
      ErrorStatusCode.IM_A_TEAPOT,
      message,
      orig,
    )
  })
})
