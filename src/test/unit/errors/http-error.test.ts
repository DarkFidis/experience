import { ErrorCode } from '../../../main/errors/http-error-codes'
import { StaticHttpErrorable } from '../../../main/types/errors'

describe('http error unit tests', () => {
  let CustomError: jest.Mocked<Error>
  let HttpError: jest.Mocked<StaticHttpErrorable>
  beforeAll(() => {
    jest.doMock('../../../main/errors/custom-error')
    ;({ CustomError } = require('../../../main/errors/custom-error'))
    ;({ HttpError } = require('../../../main/errors/http-error'))
  })
  test('should return a HttpError instance', () => {
    // Given
    const code: ErrorCode = ErrorCode.INTERNAL
    const statusCode = 599
    const message = 'oops'
    const orig = new Error('oops')
    const extra = { foo: 'bar' }
    // When
    const error = new HttpError(code, statusCode, message, orig, extra)
    // Then
    expect(error).toBeTruthy()
    expect(CustomError).toHaveBeenCalledWith(message, orig)
    expect(error.code).toEqual(code)
    expect(error.statusCode).toEqual(statusCode)
    expect(error.extra).toEqual(extra)
  })
})
