import { StaticGatewayTimeoutErrorable } from '../types/errors'
import { staticImplements } from '../utils/helper'
import { HttpError } from './http-error'
import { ErrorCode, ErrorStatusCode } from './http-error-codes'

@staticImplements<StaticGatewayTimeoutErrorable>()
class GatewayTimeoutError extends HttpError {
  public static readonly defaultMessage = 'Service did not respond in time'
  constructor(
    message: string | Error = GatewayTimeoutError.defaultMessage,
    orig?: Error,
    extra?: unknown,
  ) {
    super(ErrorCode.GATEWAY_TIMEOUT, ErrorStatusCode.GATEWAY_TIMEOUT, message, orig, extra)
  }
}

export { GatewayTimeoutError }
