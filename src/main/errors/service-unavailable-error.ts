import { StaticServiceUnavailableErrorable } from '../types/errors'
import { staticImplements } from '../utils/helper'
import { HttpError } from './http-error'
import { ErrorCode, ErrorStatusCode } from './http-error-codes'

@staticImplements<StaticServiceUnavailableErrorable>()
class ServiceUnavailableError extends HttpError {
  public static defaultMessage = 'The service is currently unavailable'
  constructor(
    message: string | Error = ServiceUnavailableError.defaultMessage,
    orig?: Error,
    extra?: unknown,
  ) {
    super(ErrorCode.SERVICE_UNAVAILABLE, ErrorStatusCode.SERVICE_UNAVAILABLE, message, orig, extra)
  }
}

export { ServiceUnavailableError }
