import { StaticInternalErrorable } from '../types/errors'
import { staticImplements } from '../utils/helper'
import { HttpError } from './http-error'
import { ErrorCode, ErrorStatusCode } from './http-error-codes'

@staticImplements<StaticInternalErrorable>()
class InternalError extends HttpError {
  constructor(message?: string | Error, orig?: Error) {
    super(ErrorCode.INTERNAL, ErrorStatusCode.INTERNAL, message, orig)
  }
}

export { InternalError }
