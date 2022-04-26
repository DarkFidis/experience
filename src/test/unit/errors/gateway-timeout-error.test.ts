import { ErrorCode, ErrorStatusCode } from '../../../main/errors/http-error-codes'
import { StaticGatewayTimeoutErrorable } from '../../../main/types/errors'

describe('gateway timeout error unit tests', () => {
  let HttpError: jest.Mocked<Error>
  let GatewayTimeoutError: jest.Mocked<StaticGatewayTimeoutErrorable>
  beforeAll(() => {
    jest.doMock('../../../main/errors/http-error')
    ;({ HttpError } = require('../../../main/errors/http-error'))
    ;({ GatewayTimeoutError } = require('../../../main/errors/gateway-timeout-error'))
  })
  test('should return a GatewayTimeoutError instance', () => {
    // When
    const error = new GatewayTimeoutError()
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.GATEWAY_TIMEOUT,
      ErrorStatusCode.GATEWAY_TIMEOUT,
      GatewayTimeoutError.defaultMessage,
      undefined,
      undefined,
    )
  })
  test('should return a GatewayTimeoutError instance given message and orig', () => {
    // Given
    const message = 'oops'
    const orig = new Error('oops')
    const extra = { foo: 'bar' }
    // When
    const error = new GatewayTimeoutError(message, orig, extra)
    // Then
    expect(error).toBeTruthy()
    expect(HttpError).toHaveBeenCalledWith(
      ErrorCode.GATEWAY_TIMEOUT,
      ErrorStatusCode.GATEWAY_TIMEOUT,
      message,
      orig,
      extra,
    )
  })
})
