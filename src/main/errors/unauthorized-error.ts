import { StaticUnauthorizedErrorable } from '../types/errors'
import { staticImplements } from '../utils/helper'
import { HttpError } from './http-error'
import { ErrorCode, ErrorStatusCode } from './http-error-codes'

@staticImplements<StaticUnauthorizedErrorable>()
class UnauthorizedError extends HttpError {
  public static defaultMessage = 'This action requires an authorization'
  constructor(message: string | Error = UnauthorizedError.defaultMessage, orig?: Error) {
    super(ErrorCode.UNAUTHORIZED, ErrorStatusCode.UNAUTHORIZED, message, orig)
  }
}

export { UnauthorizedError }
